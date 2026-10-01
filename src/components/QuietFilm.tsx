import { useEffect, useRef, useState } from "react";

const poster = `${import.meta.env.BASE_URL}bjorkhaga/web/IMG_1776.jpg`;
const clip = `${import.meta.env.BASE_URL}bjorkhaga/IMG_1780.MP4`;
const label = "Ett kort klipp från skogen i Björkhaga";

function prefersStill() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function QuietFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(prefersStill);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setStill(mediaQuery.matches);
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (still) return;

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          video.preload = "auto";
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [still]);

  return (
    <section className="film" aria-label={label}>
      <div className="film-frame">
        {still ? (
          <img src={poster} alt={label} loading="lazy" />
        ) : (
          <video
            ref={videoRef}
            src={clip}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={label}
          />
        )}
      </div>
    </section>
  );
}
