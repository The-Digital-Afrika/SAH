export const SIGNUP_COMPLETE_KEY = "home-school:mailblaze-signup-complete";

export async function subscribeToNewsletter(values: { firstName: string; lastName?: string; email: string; company?: string }) {
  const response = await fetch("/api/newsletter", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
  });
  const result = await response.json();
  if (!response.ok || result.submitted !== true) throw new Error(result.error || "Your signup could not be sent. Please try again.");
  try { window.localStorage.setItem(SIGNUP_COMPLETE_KEY, "true"); } catch { /* Storage is optional. */ }
  return String(result.message);
}
