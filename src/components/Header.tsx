import { useEffect, useState } from "react";
import { formatLunchDay, formatLunchDayShort } from "../format";

type HeaderProps = {
  lunchDate?: string | null;
};

export function Header({ lunchDate }: HeaderProps) {
  const day = lunchDate ? formatLunchDay(lunchDate) : "6 november";
  const shortDay = lunchDate ? formatLunchDayShort(lunchDate) : "6 nov";
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>(".hero");
      const header = document.querySelector(".header");
      const headerHeight = header?.getBoundingClientRect().height ?? 72;
      const limit = hero ? Math.max(24, hero.offsetHeight - headerHeight) : 24;
      setSolid(window.scrollY > limit);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header className={solid ? "header header--solid" : "header"}>
      <div className="wrap header-inner">
        <a className="wordmark" href="#top">
          <span className="wordmark-name">Grannlunch</span>
          <span className="wordmark-place">Björkhaga</span>
        </a>
        <a className="header-news" href="#nasta">
          <span className="header-news-full">
            <span aria-hidden="true">🎉 </span>
            Premiären avklarad – nästa lunch {day}!{" "}
            <span aria-hidden="true">→</span>
          </span>
          <span className="header-news-short">
            <span aria-hidden="true">🎉 </span>
            Premiären avklarad · {shortDay} nästa
          </span>
        </a>
        <nav className="nav" aria-label="Sidans avsnitt">
          <a href="#nasta">Nästa lunch</a>
          <a href="#hur">Hur funkar det?</a>
        </nav>
      </div>
    </header>
  );
}
