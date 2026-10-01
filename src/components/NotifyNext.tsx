import { useState, type FormEvent } from "react";
import { subscribeToNextLunch } from "../api";
import { isValidEmail, normalizeEmail } from "../validate";

export function NotifyNext() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
        {done ? (
          <p className="thanks" role="status">
            Tack! Vi hör av oss när nästa Grannlunch är på gång.
          </p>
        ) : (
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
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Sparar…" : "Tipsa mig nästa gång"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
