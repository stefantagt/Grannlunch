import { useCallback, useEffect, useState } from "react";
import { getNextLunch, registerForLunch, type SignupInput } from "./api";
import { About } from "./components/About";
import { ContactNote } from "./components/ContactNote";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { Neighborhood } from "./components/Neighborhood";
import { NextLunch } from "./components/NextLunch";
import { NotifyNext } from "./components/NotifyNext";
import { QuietFilm } from "./components/QuietFilm";
import { SignupDialog } from "./components/SignupDialog";
import { isSupabaseConfigured } from "./lib/supabase";
import { nextLunch } from "./mock";
import type { Lunch } from "./types";

type Phase = "mock" | "loading" | "ready" | "empty" | "error";

export default function App() {
  const configured = isSupabaseConfigured();
  const [phase, setPhase] = useState<Phase>(configured ? "loading" : "mock");
  const [lunch, setLunch] = useState<Lunch | null>(configured ? null : nextLunch);
  const [registeredCount, setRegisteredCount] = useState(
    configured ? 0 : nextLunch.registeredCount,
  );
  const [signupOpen, setSignupOpen] = useState(false);
  const [registeredEmails, setRegisteredEmails] = useState<string[]>([]);

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;

    getNextLunch()
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setPhase("empty");
          return;
        }
        setLunch(result.lunch);
        setRegisteredCount(result.registeredCount);
        setPhase("ready");
      })
      .catch(() => {
        if (!cancelled) setPhase("error");
      });

    return () => {
      cancelled = true;
    };
  }, [configured]);

  const openSignup = useCallback(() => setSignupOpen(true), []);
  const closeSignup = useCallback(() => setSignupOpen(false), []);

  const handleRegistered = useCallback(
    async (input: SignupInput) => {
      if (!lunch) return { ok: false as const, message: "Lunchen kunde inte hittas." };

      const result = await registerForLunch(lunch.id, input);
      if (!result.ok) return result;

      setRegisteredEmails((current) =>
        current.includes(input.email) ? current : [...current, input.email],
      );
      setRegisteredCount((count) => count + 1);
      return result;
    },
    [lunch],
  );

  return (
    <>
      <a className="skip" href="#innehall">
        Hoppa till innehållet
      </a>
      <Header />
      <main id="innehall">
        <div id="top" />
        <Hero />
        <HowItWorks />
        <Neighborhood />
        {lunch ? (
          <NextLunch
            lunch={lunch}
            registeredCount={registeredCount}
            onSignup={openSignup}
          />
        ) : (
          <section className="next" id="nasta" aria-labelledby="next-title">
            <article className="story event">
              <h2 id="next-title">Nästa Grannlunch</h2>
              <p className="walk">
                {phase === "error"
                  ? "Lunchen kunde inte hämtas just nu."
                  : phase === "empty"
                    ? "Nästa lunch är inte ute än. Lämna gärna din e-post längre ner."
                    : "Hämtar nästa lunch."}
              </p>
            </article>
          </section>
        )}
        <QuietFilm />
        <NotifyNext />
        <About />
        <ContactNote />
      </main>
      <Footer />
      {lunch ? (
        <SignupDialog
          lunch={lunch}
          open={signupOpen}
          registeredEmails={registeredEmails}
          onClose={closeSignup}
          onRegistered={handleRegistered}
        />
      ) : null}
    </>
  );
}
