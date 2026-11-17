type Options = { fetchImpl?: typeof fetch; siteOrigin?: string; wait?: (ms: number) => Promise<void> };
const CMS = "https://cms.homeandschool.co.za/";
const FORM_ID = "3792";
const unavailable = "Newsletter signup is temporarily unavailable. Please try again shortly.";

function attribute(tag: string, name: string) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1] ?? "";
}
function findForm(html: string) {
  return [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/gi)]
    .map(match => match[0]).find(form => attribute(form.match(/^<form[^>]*>/i)![0], "data-id") === FORM_ID);
}
function text(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
}

export async function submitNewsletter(request: Request, { fetchImpl = fetch, siteOrigin, wait = ms => new Promise(resolve => setTimeout(resolve, ms)) }: Options = {}) {
  const origin = request.headers.get("origin");
  if (origin && ![new URL(request.url).origin, siteOrigin].includes(origin))
    return Response.json({ error: "Please sign up from this website." }, { status: 403 });
  let values;
  try {
    const body = await request.text();
    if (body.length > 4000) return Response.json({ error: "Signup details are too long." }, { status: 413 });
    values = JSON.parse(body);
  } catch { return Response.json({ error: "Invalid signup details." }, { status: 400 }); }
  if (!values || typeof values !== "object" || Array.isArray(values)) return Response.json({ error: "Invalid signup details." }, { status: 400 });
  const { firstName = "", lastName = "", email, company = "" } = values;
  if (company || typeof firstName !== "string" || firstName.length > 100 || typeof lastName !== "string" || lastName.length > 100 ||
    typeof email !== "string" || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return Response.json({ error: "Please enter a valid email address and check your details." }, { status: 400 });
  try {
    // Use the existing plugin form so list selection, opt-in and messages stay in WordPress.
    const page = await fetchImpl(CMS, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
    if (!page.ok) throw new Error("CMS form unavailable");
    const form = findForm(await page.text());
    if (!form || /(?:g-recaptcha|h-captcha|cf-turnstile)/i.test(form)) throw new Error("CMS form requires interactive verification");
    const hidden = new Map([...form.matchAll(/<input\b[^>]*>/gi)].map(match => [attribute(match[0], "name"), attribute(match[0], "value")]));
    const timestamp = Number(hidden.get("_mb4wp_timestamp"));
    const elementId = hidden.get("_mb4wp_form_element_id");
    if (!Number.isFinite(timestamp) || timestamp < 1 || !elementId || hidden.get("_mb4wp_form_id") !== FORM_ID) throw new Error("Invalid CMS form");
    // Preserve the plugin's two-second timing check rather than inventing a timestamp.
    const delay = timestamp * 1000 + 3000 - Date.now();
    if (delay > 5000) throw new Error("CMS clock mismatch");
    if (delay > 0) await wait(delay);
    const result = await fetchImpl(CMS, {
      method: "POST", cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Referer": CMS },
      body: new URLSearchParams({ NAME: firstName.trim(), LNAME: lastName.trim(), EMAIL: email.trim(),
        _mb4wp_form_id: FORM_ID, _mb4wp_form_element_id: elementId, _mb4wp_timestamp: String(timestamp), _mb4wp_honeypot: "" }),
    });
    // A 200, redirect or generic thank-you page alone is not proof of subscription.
    if (result.status !== 200) throw new Error("Unverified CMS response");
    const submitted = findForm(await result.text());
    if (!submitted) throw new Error("Missing CMS confirmation");
    const opening = submitted.match(/^<form[^>]*>/i)![0];
    const success = attribute(opening, "class").split(/\s+/).includes("mb4wp-form-success");
    const notice = [...submitted.matchAll(/<div\b[^>]*>/gi)]
      .find(match => attribute(match[0], "class").split(/\s+/).includes("mb4wp-success"));
    if (!success || !notice) return Response.json({ error: "The newsletter service could not accept your signup. Please check your details or try again shortly." }, { status: 502 });
    const message = submitted.slice(notice.index! + notice[0].length).split(/<\/div>/i)[0];
    return Response.json({ submitted: true, message: text(message) || "Thank you. Please check your inbox for any confirmation email." });
  } catch {
    return Response.json({ error: unavailable }, { status: 502 });
  }
}
