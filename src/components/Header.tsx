export function Header() {
  return (
    <header className="header">
      <div className="wrap header-inner">
        <a className="wordmark" href="#top">
          Grannlunch
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
