import { useEffect, useState } from "react";

export function Header() {
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
        <nav className="nav" aria-label="Sidans avsnitt">
          <a href="#nasta">Nästa lunch</a>
          <a href="#hur">Hur funkar det?</a>
        </nav>
      </div>
    </header>
  );
}
