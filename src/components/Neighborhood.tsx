import { useEffect, useRef, useState } from "react";

const media = (file: string) => `${import.meta.env.BASE_URL}bjorkhaga/web/${file}`;
const clip = `${import.meta.env.BASE_URL}bjorkhaga/IMG_1780.MP4`;

const support = [
  {
    src: media("IMG_1789.jpg"),
    alt: "Grusgång mellan träd och häckar i Björkhaga",
  },
  {
    src: media("IMG_1777.jpg"),
    alt: "En träspång inne bland träden",
  },
  {
    src: media("IMG_1775.jpg"),
    alt: "Ett orange höstträd bland tallarna",
  },
];

const flow = [
  {
    src: media("IMG_1769.jpg"),
    alt: "Tallar mot blå himmel",
  },
  {
    src: media("IMG_1770.jpg"),
    alt: "Höga tallar i en glänta",
  },
  {
    src: media("IMG_1776.jpg"),
    alt: "Gräs och träd i kvällsljus",
  },
  {
    src: media("IMG_1774.jpg"),
    alt: "En gata med lyktstolpar och höstträd",
  },
];

export function Neighborhood() {
  return (
    <section className="woods" id="omradet" aria-labelledby="woods-title">
      <div className="story">
        <h2 id="woods-title">Runt knuten i Björkhaga.</h2>
        <figure className="woods-lead">
          <Photo
            src={media("IMG_1778.jpg")}
            alt="En stig mellan två stora stenar, in mot skogen"
          />
        </figure>
        <div className="woods-support">
          {support.map((photo) => (
            <Photo key={photo.src} src={photo.src} alt={photo.alt} />
          ))}
        </div>
      </div>
      <div className="woods-flow" tabIndex={0} aria-label="Fler bilder från området">
        {flow.map((photo) => (
          <Photo key={photo.src} src={photo.src} alt={photo.alt} />
        ))}
        <QuietClip
          src={clip}
          poster={media("IMG_1778.jpg")}
          label="Ett kort klipp från skogen i Björkhaga"
        />
      </div>
    </section>
  );
}

function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="photo">
      <img src={src} alt={alt} />
    </figure>
  );
}

function QuietClip({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setStill(true);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          void video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { threshold: 0.45 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="photo">
      {still ? (
        <img src={poster} alt={label} />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          playsInline
          loop
          preload="metadata"
          aria-label={label}
        />
      )}
    </figure>
  );
}
