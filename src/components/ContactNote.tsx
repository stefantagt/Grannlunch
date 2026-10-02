import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { submitMessage, type MessageInput } from "../api";
import { isValidEmail, normalizeEmail } from "../validate";

type FieldErrors = {
  name?: string;
  message?: string;
  email?: string;
};

export function ContactNote() {
  const openRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <section className="note" aria-labelledby="note-title">
      <div className="story">
        <h2 id="note-title">Något du undrar över?</h2>
        <p>Fråga, tipsa eller säg hej.</p>
        <button
          className="note-open"
          type="button"
          ref={openRef}
          onClick={() => setOpen(true)}
        >
          Skicka ett meddelande
          <span aria-hidden="true"> →</span>
        </button>
      </div>
      {open ? <MessageDialog opener={openRef} onClose={() => setOpen(false)} /> : null}
    </section>
  );
}

function MessageDialog({
  opener,
  onClose,
}: {
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const titleId = useId();
  const introId = useId();
  const nameId = useId();
  const messageId = useId();
  const emailId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    panelRef.current?.focus();

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

  useEffect(() => {
    if (done) closeRef.current?.focus();
  }, [done]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const nextName = name.trim();
    const nextMessage = message.trim();
    const nextEmail = email.trim();
    const nextErrors: FieldErrors = {};

    if (!nextName) nextErrors.name = "Skriv ditt namn.";
    if (!nextMessage) nextErrors.message = "Skriv ett meddelande.";
    if (nextEmail && !isValidEmail(normalizeEmail(nextEmail))) {
      nextErrors.email = "Skriv en giltig e-postadress.";
    }

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.message || nextErrors.email) {
      if (nextErrors.name) nameRef.current?.focus();
      else if (nextErrors.message) messageRef.current?.focus();
      else emailRef.current?.focus();
      return;
    }

    const input: MessageInput = {
      name: nextName,
      email: nextEmail ? normalizeEmail(nextEmail) : null,
      message: nextMessage,
    };

    setSaving(true);
    const result = await submitMessage(input);
    setSaving(false);

    if (!result.ok) {
      setErrors({ message: result.message });
      messageRef.current?.focus();
      return;
    }

    setDone(true);
  }

  const emailHintId = `${emailId}-hint`;
  const emailErrorId = `${emailId}-error`;

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
        aria-describedby={done ? undefined : introId}
        tabIndex={-1}
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Stäng">
          <span aria-hidden="true">×</span>
        </button>

        {done ? (
          <div className="note-success">
            <h2 id={titleId}>
              Tack! <span aria-hidden="true">🙌</span>
            </h2>
            <p className="success-lead">Ha en fin dag!</p>
            <button className="note-dismiss" type="button" onClick={onClose} ref={closeRef}>
              Stäng
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId}>
              Hej! <span aria-hidden="true">👋</span>
            </h2>
            <p className="note-intro" id={introId}>
              Har du en fråga, ett tips på lunchställe eller något annat?
            </p>
            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor={nameId}>Namn</label>
                <input
                  id={nameId}
                  ref={nameRef}
                  name="name"
                  autoComplete="name"
                  placeholder="Ditt namn"
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${nameId}-error` : undefined}
                />
                {errors.name ? (
                  <p className="field-error" id={`${nameId}-error`} role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor={messageId}>Meddelande</label>
                <textarea
                  id={messageId}
                  ref={messageRef}
                  name="message"
                  placeholder="Skriv ditt meddelande här..."
                  value={message}
                  rows={5}
                  maxLength={2000}
                  onChange={(event) => setMessage(event.target.value)}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={errors.message ? `${messageId}-error` : undefined}
                />
                {errors.message ? (
                  <p className="field-error" id={`${messageId}-error`} role="alert">
                    {errors.message}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor={emailId}>
                  E-post <span className="field-optional">valfritt</span>
                </label>
                <input
                  id={emailId}
                  ref={emailRef}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="din@email.se"
                  value={email}
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? `${emailHintId} ${emailErrorId}` : emailHintId}
                />
                <p className="field-hint" id={emailHintId}>
                  Din e-post används bara om jag behöver svara på ditt meddelande.
                </p>
                {errors.email ? (
                  <p className="field-error" id={emailErrorId} role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <button className="button button-block" type="submit" disabled={saving}>
                {saving ? "Skickar…" : "Skicka meddelande"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
