"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SIGNUP_COMPLETE_KEY, subscribeToNewsletter } from "@/lib/newsletter-client";

const POPUP_DELAY_MS = 180_000;
const POPUP_SEEN_PATHS_KEY = "sa-home-school:community-popup-seen-paths";

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 5000,
  display: "grid",
  placeItems: "center",
  padding: 24,
};

const backdropStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  border: 0,
  background: "rgba(8, 12, 18, 0.62)",
  cursor: "pointer",
};

const dialogStyle: CSSProperties = {
  position: "relative",
  zIndex: 1,
  width: "min(100%, 460px)",
  maxHeight: "calc(100vh - 48px)",
  overflowY: "auto",
  padding: "38px",
  border: "1px solid rgba(229, 31, 88, 0.16)",
  borderRadius: 8,
  background: "#ffffff",
  boxShadow: "0 28px 80px rgba(8, 12, 18, 0.28)",
};

const closeStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 36,
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: 0,
  borderRadius: 999,
  background: "#ffffff",
  color: "#192638",
  boxShadow: "0 8px 18px rgba(18, 24, 34, 0.12)",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  border: "1px solid rgba(229, 31, 88, 0.2)",
  borderRadius: 7,
  background: "#ffffff",
  color: "#101722",
  font: "inherit",
  padding: "0 14px",
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 14,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 7,
};

const labelStyle: CSSProperties = {
  color: "#101722",
  fontSize: 13,
  fontWeight: 900,
};

const submitStyle: CSSProperties = {
  width: "100%",
  minHeight: 48,
  marginTop: 4,
  padding: "0 20px",
  border: 0,
  borderRadius: 7,
  background: "var(--brand-pink)",
  color: "#ffffff",
  boxShadow: "none",
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
};

function hasSignedUp() {
  try {
    return window.localStorage.getItem(SIGNUP_COMPLETE_KEY) === "true";
  } catch {
    return false;
  }
}

function getSeenPaths() {
  try {
    const storedPaths = window.sessionStorage.getItem(POPUP_SEEN_PATHS_KEY);
    return storedPaths ? (JSON.parse(storedPaths) as string[]) : [];
  } catch {
    return [];
  }
}

function markPathAsSeen(pathname: string) {
  try {
    const paths = new Set(getSeenPaths());
    paths.add(pathname);
    window.sessionStorage.setItem(POPUP_SEEN_PATHS_KEY, JSON.stringify([...paths]));
  } catch {
    // Storage can be unavailable in private or restricted browser modes.
  }
}

function shouldPreviewPopup() {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get("signupPopup") === "preview";
  } catch {
    return false;
  }
}

export default function SignupPopup() {
  const pathname = usePathname();
  const [popupPath, setPopupPath] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const resetOpenPopup = window.setTimeout(() => {
      setPopupPath((currentPath) => (currentPath === pathname ? currentPath : null));
    }, 0);

    return () => window.clearTimeout(resetOpenPopup);
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (shouldPreviewPopup()) {
      const previewTimer = window.setTimeout(() => {
        setSubmitted(false);
        setPopupPath(pathname);
      }, 0);

      return () => window.clearTimeout(previewTimer);
    }

    if (hasSignedUp()) {
      return;
    }

    if (getSeenPaths().includes(pathname)) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (hasSignedUp()) {
        return;
      }

      markPathAsSeen(pathname);
      setSubmitted(false);
      setPopupPath(pathname);
    }, POPUP_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  function closePopup() {
    markPathAsSeen(pathname);
    setPopupPath(null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || submitted) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setPending(true);
    setMessage("");
    try {
      setMessage(await subscribeToNewsletter({ firstName: String(values.get("name") ?? ""), lastName: String(values.get("surname") ?? ""), email: String(values.get("email") ?? ""), company: String(values.get("company") ?? "") }));
      setSubmitted(true);
      form.reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Your signup could not be sent. Please try again."); }
    finally { setPending(false); }
  }

  if (popupPath !== pathname) {
    return null;
  }

  return (
    <div className="signup-popup" role="presentation" style={overlayStyle}>
      <button
        className="signup-popup__backdrop"
        type="button"
        aria-label="Close sign up popup"
        onClick={closePopup}
        style={backdropStyle}
      />
      <section className="signup-popup__dialog" role="dialog" aria-modal="true" aria-labelledby="signup-popup-title" style={dialogStyle}>
        <button className="signup-popup__close" type="button" aria-label="Close sign up popup" onClick={closePopup} style={closeStyle}>
          X
        </button>

        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
          <defs>
            <filter id="signup-logo-brand" colorInterpolationFilters="sRGB">
              {/* White lettering becomes black; the coloured ampersand becomes brand pink. */}
              <feColorMatrix type="matrix" values="0 -0.914 0 0 0.914  0 -0.157 0 0 0.157  0 -0.365 0 0 0.365  0 0 0 1 0" />
            </filter>
          </defs>
        </svg>
        <Image className="signup-popup__logo" src="/images/home-school-flourish-logo.png" alt="Home & School" width={2169} height={725} sizes="220px" />
        <h2 id="signup-popup-title">Join our community</h2>
        <p className="signup-popup__intro">Fresh homeschooling ideas, resources, and family inspiration straight to your inbox.</p>

        <form className="signup-popup__form" onSubmit={onSubmit} style={formStyle} aria-busy={pending}>
          <div className="signup-popup__field" style={fieldStyle}>
            <label htmlFor="community-popup-name" style={labelStyle}>Name</label>
            <input id="community-popup-name" name="name" type="text" autoComplete="given-name" required style={inputStyle} />
          </div>

          <div className="signup-popup__field" style={fieldStyle}>
            <label htmlFor="community-popup-surname" style={labelStyle}>Surname</label>
            <input
              id="community-popup-surname"
              name="surname"
              type="text"
              autoComplete="family-name"

              required
              style={inputStyle}
            />
          </div>

          <div className="signup-popup__field" style={fieldStyle}>
            <label htmlFor="community-popup-email" style={labelStyle}>Email</label>
            <input
              id="community-popup-email"
              name="email"
              type="email"
              autoComplete="email"

              required
              style={inputStyle}
            />
          </div>

          <div hidden aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
          <button className="signup-popup__submit" type="submit" style={submitStyle} disabled={pending || submitted}>
            {pending ? "Signing up…" : submitted ? "Signup received" : "Sign up"}
          </button>

          {message ? <p className="signup-popup__message" role={submitted ? "status" : "alert"}>{message}</p> : null}
        </form>
      </section>
    </div>
  );
}
