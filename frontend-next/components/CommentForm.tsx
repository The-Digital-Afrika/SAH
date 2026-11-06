"use client";

import { useState, type FormEvent } from "react";
import styles from "./CommentForm.module.css";
import { subscribeToNewsletter } from "@/lib/newsletter-client";

export default function CommentForm({ postId }: { postId: number }) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [newsletterRetry, setNewsletterRetry] = useState<{ firstName: string; email: string } | null>(null);
  const [newsletterPending, setNewsletterPending] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const prefix = `comment-${postId}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || success) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setMessage("");
    setSuccess(false);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, comment: values.get("comment"), name: values.get("name"), email: values.get("email"), website: values.get("website"), company: values.get("company") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your comment could not be sent. Please try again.");
      setSuccess(true);
      setMessage("Thank you. Your comment has been submitted and may appear after moderation.");
      if (values.get("newsletter") === "yes") {
        const signup = { firstName: String(values.get("name") ?? ""), email: String(values.get("email") ?? "") };
        try { setNewsletterMessage(await subscribeToNewsletter(signup)); }
        catch { setNewsletterRetry(signup); setNewsletterMessage("Your comment was submitted, but newsletter signup failed. You can retry the signup below."); }
      }
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your comment could not be sent. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function retryNewsletter() {
    if (!newsletterRetry || newsletterPending) return;
    setNewsletterPending(true);
    try { setNewsletterMessage(await subscribeToNewsletter(newsletterRetry)); setNewsletterRetry(null); }
    catch { setNewsletterMessage("Newsletter signup is still unavailable. Please try again shortly."); }
    finally { setNewsletterPending(false); }
  }

  return (
    <section id="comments" className={styles.section} aria-labelledby={`${prefix}-title`}>
      <h2 id={`${prefix}-title`}>Leave a comment</h2>
      <p>Your email address will not be published. Required fields are marked *</p>
      <form className={styles.form} onSubmit={submit} aria-busy={pending}>
        <div className={styles.field}>
          <label htmlFor={`${prefix}-text`}>Comment *</label>
          <textarea id={`${prefix}-text`} name="comment" rows={7} maxLength={20000} required />
        </div>
        <div className={styles.row}>
          <div className={styles.field}><label htmlFor={`${prefix}-name`}>Name *</label><input id={`${prefix}-name`} name="name" autoComplete="name" maxLength={245} required /></div>
          <div className={styles.field}><label htmlFor={`${prefix}-email`}>Email *</label><input id={`${prefix}-email`} name="email" type="email" autoComplete="email" maxLength={100} required /></div>
        </div>
        <div className={styles.field}><label htmlFor={`${prefix}-website`}>Website</label><input id={`${prefix}-website`} name="website" type="url" autoComplete="url" maxLength={2000} /></div>
        <div className={styles.trap} aria-hidden="true"><label htmlFor={`${prefix}-company`}>Company</label><input id={`${prefix}-company`} name="company" tabIndex={-1} autoComplete="off" /></div>
        <div className={styles.newsletter}>
          <label><input type="checkbox" name="newsletter" value="yes" disabled={pending || success} />Sign me up for the newsletter!</label>
        </div>
        <button type="submit" disabled={pending || success}>{pending ? "Posting…" : success ? "Comment submitted" : "Post Comment"}</button>
        {message ? <p className={styles.message} role={success ? "status" : "alert"}>{message}</p> : null}
        {newsletterMessage ? <p className={styles.message} role={newsletterRetry ? "alert" : "status"}>{newsletterMessage}</p> : null}
        {newsletterRetry ? <button type="button" onClick={retryNewsletter} disabled={newsletterPending}>{newsletterPending ? "Signing up…" : "Retry newsletter signup"}</button> : null}
      </form>
    </section>
  );
}
