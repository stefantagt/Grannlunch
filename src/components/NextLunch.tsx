import {
  attendanceLabel,
  formatLunchDate,
  placeLabel,
  spotsLabel,
  spotsLeft,
} from "../format";
import type { Lunch } from "../types";

type NextLunchProps = {
  lunch: Lunch;
  registeredCount: number;
  onSignup: () => void;
};

export function NextLunch({ lunch, registeredCount, onSignup }: NextLunchProps) {
  const spots = spotsLeft(lunch, registeredCount);
  const attendance = attendanceLabel(registeredCount);
  const full = spots === 0;

  return (
    <section className="next" id="nasta" aria-labelledby="next-title">
      <article className="story event">
        {lunch.offerText ? <p className="badge">{lunch.offerText}</p> : null}
        <h2 id="next-title">Nästa Grannlunch</h2>
        <p className="event-date">{formatLunchDate(lunch.date)}</p>
        <dl className="times">
          <div>
            <dt>Samling</dt>
            <dd>{lunch.meetingTime}</dd>
          </div>
          <div>
            <dt>Lunch</dt>
            <dd>cirka {lunch.lunchTime}</dd>
          </div>
        </dl>
        <div className="place">
          <p className="place-label">Plats</p>
          {lunch.restaurantUrl ? (
            <a
              className="place-name"
              href={lunch.restaurantUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {placeLabel(lunch)}
            </a>
          ) : (
            <p className="place-name">{placeLabel(lunch)}</p>
          )}
          <p className="walk">{lunch.meetingPoint}</p>
        </div>
        <div className="stats">
          {attendance ? <p>{attendance}</p> : null}
          {spots != null ? <p>{spotsLabel(spots)}</p> : null}
        </div>
        <button
          className="button button-block"
          type="button"
          onClick={onSignup}
          disabled={full}
        >
          {full ? "Inga platser kvar" : "Jag hänger med!"}
        </button>
      </article>
    </section>
  );
}
