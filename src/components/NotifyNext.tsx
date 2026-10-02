import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { subscribeToNextLunch } from "../api";
import { isValidEmail, normalizeEmail } from "../validate";

export function NotifyNext() {
  const submitRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const closeDone = useCallback(() => setDone(false), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEmail = normalizeEmail(email);

    if (!isValidEmail(nextEmail)) {
      setError("Skriv en giltig e-postadress.");
      return;
    }

    if (saving) return;
    setSaving(true);
    const result = await subscribeToNextLunch(nextEmail);
    setSaving(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setError("");
    setEmail("");
    setDone(true);
  }

  return (
    <section className="band band-clay" id="nasta-gang" aria-labelledby="notify-title">
      <div className="story notify">
        <p className="eyebrow">Intresserad av nästa lunch?</p>
        <h2 id="notify-title">Kan du inte följa med den här gången?</h2>
        <p>
          Lämna din e-post så berättar vi när nästa Grannlunch är på gång.
        </p>
        <form className="form inline-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="notify-email">E-post</label>
            <input
              id="notify-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              maxLength={254}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "notify-email-error" : undefined}
            />
            {error ? (
              <p className="field-error" id="notify-email-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <button className="button" type="submit" disabled={saving} ref={submitRef}>
            {saving ? "Sparar…" : "Tipsa mig nästa gång"}
          </button>
        </form>
      </div>
      {done ? <NotifyDone opener={submitRef} onClose={closeDone} /> : null}
    </section>
  );
}

function NotifyDone({
  opener,
  onClose,
}: {
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    okRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])',
        ),
      ].filter((element) => !element.hasAttribute("disabled"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener.current?.focus();
    };
  }, [onClose, opener]);

  return (
    <div
      className="dialog-backdrop note-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog note-dialog"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Stäng">
          <span aria-hidden="true">×</span>
        </button>
        <div className="note-success">
          <h2 id={titleId}>Din e-post är registrerad.</h2>
          <p className="success-lead">Vi hör av oss inför nästa Grannlunch.</p>
          <button className="button" type="button" onClick={onClose} ref={okRef}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
