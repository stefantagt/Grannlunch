import { HouseIcon, LunchIcon, NeighborsIcon, WalkIcon } from "./Icons";

const heroPhoto = `${import.meta.env.BASE_URL}bjorkhaga/web/IMG_1778.jpg`;

const symbols = [
  { label: "Hemmakontor", Icon: HouseIcon },
  { label: "Promenad", Icon: WalkIcon },
  { label: "Socialt", Icon: NeighborsIcon },
  { label: "Lunch", Icon: LunchIcon },
];

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden="true">
        <img className="hero-photo" src={heroPhoto} alt="" />
        <div className="hero-shade" />
      </div>
      <div className="story">
        <ul className="symbols">
          {symbols.map(({ label, Icon }) => (
            <li key={label}>
              <span className="symbol-icon">
                <Icon />
              </span>
              {label}
            </li>
          ))}
        </ul>
        <h1 id="hero-title">
          Lunch med grannarna.{" "}
          <span className="hero-accent">En promenad bort.</span>
        </h1>
        <p className="lede">
          Jobbar du hemma ibland? Det gör säkert flera av dina grannar i
          Björkhaga också. Häng med ut från hemmakontoret på en gemensam
          promenad och lunch.
        </p>
        <div className="actions">
          <a className="button" href="#nasta">
            Se nästa lunch
          </a>
          <a className="button button-secondary" href="#hur">
            Hur funkar det?
          </a>
        </div>
      </div>
    </section>
  );
}
