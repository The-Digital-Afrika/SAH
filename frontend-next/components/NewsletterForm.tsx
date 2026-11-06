"use client";

import { FormEvent, useState } from "react";

import { subscribeToNewsletter } from "@/lib/newsletter-client";

type NewsletterFormProps = {
  idPrefix: string;
  className?: string;
  title?: string;
  showKicker?: boolean;
  headingLevel?: "h1" | "h2";
};

export default function NewsletterForm({
  idPrefix,
  className = "sidebar-newsletter labeled",
  title = "Join our community",
  showKicker = false,
  headingLevel = "h2",
}: NewsletterFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const Heading = headingLevel;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitted) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setMessage("");
    try {
      setMessage(await subscribeToNewsletter({ firstName: String(values.get("first-name") ?? ""), lastName: String(values.get("last-name") ?? ""), email: String(values.get("email") ?? ""), company: String(values.get("company") ?? "") }));
      setSubmitted(true);
      form.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Your signup could not be sent. Please try again."); }
    finally { setPending(false); }
  }

  return (
    <form className={className} onSubmit={onSubmit} aria-busy={pending}>
      {showKicker ? <span className="kicker">Newsletter</span> : <div className="section-rule" />}
      <Heading>{title}</Heading>
      <div className="field-row field-row--first-name">
        <label htmlFor={`${idPrefix}-name`}>Name</label>
        <input id={`${idPrefix}-name`} name="first-name" type="text" />
      </div>
      <div className="field-row field-row--last-name">
        <label htmlFor={`${idPrefix}-last-name`}>Last name</label>
        <input id={`${idPrefix}-last-name`} name="last-name" type="text" />
      </div>
      <div className="field-row field-row--email">
        <label htmlFor={`${idPrefix}-email`}>Email address:</label>
        <input id={`${idPrefix}-email`} name="email" type="email" required />
      </div>
      <div hidden aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="signup-button" type="submit" disabled={pending || submitted}>
        {pending ? "Signing up…" : submitted ? "Signup received" : "Sign up"}
      </button>
      {message ? <p className="form-message" role={submitted ? "status" : "alert"}>{message}</p> : null}
    </form>
  );
}
