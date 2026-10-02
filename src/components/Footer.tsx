import { useEffect, useId, useRef, useState, type RefObject } from "react";

export function Footer() {
  const openRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <footer className="footer" id="integritet">
      <div className="story footer-bar">
        <p>Grannlunch · Åkersberga</p>
        <button
          className="note-open"
          type="button"
          ref={openRef}
          onClick={() => setOpen(true)}
        >
          Integritet
        </button>
      </div>
      {open ? <PrivacyDialog opener={openRef} onClose={() => setOpen(false)} /> : null}
    </footer>
  );
}

function PrivacyDialog({
  opener,
  onClose,
}: {
  opener: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

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
        <h2 id={titleId}>Integritet</h2>
        <p className="note-intro">
          Vi använder endast ditt namn och din e-post för att administrera
          Grannlunch och kontakta dig kring de aktiviteter du själv valt att
          delta i. Uppgifterna delas inte med andra och tas bort på
          begäran.
        </p>
        <button className="note-dismiss" type="button" onClick={onClose}>
          Stäng
        </button>
      </div>
    </div>
  );
}
