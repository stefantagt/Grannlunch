import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SaveResult, SignupInput } from "../api";
import { formatLunchDate, placeLabel } from "../format";
import type { Lunch } from "../types";
import { isValidEmail, isValidName, normalizeEmail } from "../validate";

type SignupDialogProps = {
  lunch: Lunch;
  open: boolean;
  registeredEmails: string[];
  onClose: () => void;
  onRegistered: (input: SignupInput) => Promise<SaveResult>;
};

export function SignupDialog(props: SignupDialogProps) {
  if (!props.open) return null;
  return <SignupForm {...props} />;
}

function SignupForm({
  lunch,
  registeredEmails,
  onClose,
  onRegistered,
}: SignupDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [futureUpdates, setFutureUpdates] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    nameRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = [
        ...panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
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
      previous?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    if (done) closeRef.current?.focus();
  }, [done]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = normalizeEmail(email);
    const nextErrors: { name?: string; email?: string } = {};

    if (!isValidName(nextName)) {
      nextErrors.name = "Skriv ditt namn, mellan 2 och 80 tecken.";
    }

    if (!isValidEmail(nextEmail)) {
      nextErrors.email = "Skriv en giltig e-postadress.";
    } else if (registeredEmails.includes(nextEmail)) {
      nextErrors.email = "Den här e-postadressen är redan anmäld till lunchen.";
    }

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || saving) return;

    setSaving(true);
    const result = await onRegistered({
      name: nextName,
      email: nextEmail,
      joiningWalk: true,
      futureUpdates,
    });
    setSaving(false);

    if (!result.ok) {
      setErrors({ email: result.message });
      return;
    }

    setDone(true);
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="dialog"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Stäng">
          <span aria-hidden="true">×</span>
        </button>

        {done ? (
          <div className="success">
            <h2 id={titleId}>
              <span aria-hidden="true">🎉 </span>Kul! Du är med.
            </h2>
            <p className="success-lead">Vi ses.</p>
            <dl className="success-details">
              <div>
                <dt>Datum</dt>
                <dd>{formatLunchDate(lunch.date)}</dd>
              </div>
              <div>
                <dt>Samling</dt>
                <dd>{lunch.meetingTime}</dd>
              </div>
              <div>
                <dt>Plats</dt>
                <dd>{placeLabel(lunch)}</dd>
              </div>
            </dl>
            <p>Vi promenerar tillsammans från området.</p>
            {futureUpdates ? (
              <p>Vi tipsar dig när nästa Grannlunch släpps.</p>
            ) : null}
            <button className="button button-block" type="button" onClick={onClose} ref={closeRef}>
              Stäng
            </button>
          </div>
        ) : (
          <>
            <h2 id={titleId}>Anmäl dig</h2>
            <p className="dialog-date">{formatLunchDate(lunch.date)}</p>
            <form className="form" onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="signup-name">Namn</label>
                <input
                  id="signup-name"
                  ref={nameRef}
                  name="name"
                  autoComplete="name"
                  value={name}
                  maxLength={80}
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "signup-name-error" : undefined}
                />
                {errors.name ? (
                  <p className="field-error" id="signup-name-error" role="alert">
                    {errors.name}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="signup-email">E-post</label>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={email}
                  maxLength={254}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "signup-email-error" : undefined}
                />
                {errors.email ? (
                  <p className="field-error" id="signup-email-error" role="alert">
                    {errors.email}
                  </p>
                ) : null}
              </div>
              <label className="check">
                <input
                  type="checkbox"
                  checked={futureUpdates}
                  onChange={(event) => setFutureUpdates(event.target.checked)}
                />
                <span>Tipsa mig nästa gång också</span>
              </label>
              <button className="button button-block" type="submit" disabled={saving}>
                {saving ? "Anmäl…" : "Anmäl mig"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
