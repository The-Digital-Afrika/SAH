type Dependencies = { fetchImpl?: typeof fetch; wordpressOrigin?: string; siteOrigin?: string };

export async function submitComment(request: Request, { fetchImpl = fetch, wordpressOrigin = "https://cms.homeandschool.co.za", siteOrigin }: Dependencies = {}) {
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([new URL(request.url).origin, siteOrigin]);
  if (origin && !allowedOrigins.has(origin)) return Response.json({ error: "Please submit your comment from this website." }, { status: 403 });
  let values;
  try {
    const body = await request.text();
    if (body.length > 30000) return Response.json({ error: "Your comment is too long." }, { status: 413 });
    values = JSON.parse(body);
  } catch { return Response.json({ error: "Invalid comment submission." }, { status: 400 }); }
  if (!values || typeof values !== "object" || Array.isArray(values)) return Response.json({ error: "Invalid comment submission." }, { status: 400 });
  const { postId, comment, name, email, website = "", company = "" } = values;
  if (company || !Number.isSafeInteger(postId) || postId < 1 ||
    typeof comment !== "string" || !comment.trim() || comment.length > 20000 ||
    typeof name !== "string" || !name.trim() || name.length > 245 ||
    typeof email !== "string" || email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof website !== "string" || website.length > 2000) {
    return Response.json({ error: "Please enter a comment, your name and a valid email address." }, { status: 400 });
  }
  if (website) {
    try { if (!["http:", "https:"].includes(new URL(website).protocol)) throw new Error(); }
    catch { return Response.json({ error: "Please enter a valid website address, including https://." }, { status: 400 }); }
  }
  try {
    const endpoint = new URL("/wp-comments-post.php", wordpressOrigin);
    const upstream = await fetchImpl(endpoint, {
      method: "POST", redirect: "manual", signal: AbortSignal.timeout(10000),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ comment_post_ID: String(postId), comment_parent: "0", author: name.trim(), email: email.trim(), url: website, comment: comment.trim(), redirect_to: endpoint.origin + "/" }),
    });
    // WordPress redirects only after accepting the comment; do not follow it or expose cookies.
    if ([302, 303].includes(upstream.status) && upstream.headers.has("location")) {
      const location = new URL(upstream.headers.get("location")!, endpoint);
      if (location.origin === endpoint.origin && (/^#comment-\d+$/.test(location.hash) || /^\d+$/.test(location.searchParams.get("unapproved") ?? ""))) {
        return Response.json({ submitted: true });
      }
      return Response.json({ error: "WordPress did not confirm the comment. Please check whether comments are enabled." }, { status: 502 });
    }
    if (upstream.status === 429 || upstream.status === 409) return Response.json({ error: "Please wait a little before posting again. Your comment may already have been submitted." }, { status: upstream.status });
    if ([401, 403].includes(upstream.status)) return Response.json({ error: "WordPress is not accepting public comments on this article. Please try again later." }, { status: 403 });
    return Response.json({ error: "WordPress could not accept this comment. Comments may be closed or it may be a duplicate." }, { status: 400 });
  } catch {
    return Response.json({ error: "We could not reach the comment service. Please try again shortly." }, { status: 502 });
  }
}
