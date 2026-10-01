import { useState } from "react";

const media = (file: string) => `${import.meta.env.BASE_URL}bjorkhaga/web/${file}`;

const frames = [
  {
    src: media("IMG_1789.jpg"),
    alt: "Grusgång mellan träd och häckar i Björkhaga",
    y: "62%",
  },
  {
    src: media("IMG_1770.jpg"),
    alt: "Höga tallar och en gräsmatta i Björkhaga",
    y: "68%",
  },
  {
    src: media("IMG_1777.jpg"),
    alt: "En träspång inne bland träden",
    y: "74%",
  },
  {
    src: media("IMG_1775.jpg"),
    alt: "Ett orange höstträd bland tallarna",
    y: "50%",
    zoom: "0.78",
  },
  {
    src: media("IMG_1776.jpg"),
    alt: "Gräs och träd i kvällsljus",
    y: "50%",
  },
];

export function Neighborhood() {
  const [index, setIndex] = useState(0);
  const current = frames[index];

  return (
    <section className="woods" id="omradet" aria-labelledby="woods-title">
      <div className="story">
        <h2 id="woods-title">Runt knuten i Björkhaga.</h2>
        <div className="breath">
          <button
            className="breath-next"
            type="button"
            aria-label={`${current.alt}. Bild ${index + 1} av ${frames.length}. Visa nästa bild.`}
            onClick={() => setIndex((value) => (value + 1) % frames.length)}
          >
            {frames.map((frame, frameIndex) => (
              <span key={frame.src}>
                {frame.zoom ? (
                  <img
                    src={frame.src}
                    alt=""
                    loading="lazy"
                    className={frameIndex === index ? "breath-fill is-shown" : "breath-fill"}
                    aria-hidden="true"
                  />
                ) : null}
                <img
                  src={frame.src}
                  alt=""
                  loading="lazy"
                  className={[
                    frameIndex === index ? "is-shown" : "",
                    frame.zoom ? "breath-zoomed" : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                  style={
                    {
                      "--frame-y": frame.y,
                      "--frame-zoom": frame.zoom ?? "1",
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
              </span>
            ))}
          </button>
          <span className="breath-marks" aria-hidden="true">
            {frames.map((frame, frameIndex) => (
              <span key={frame.src} className={frameIndex === index ? "is-on" : undefined} />
            ))}
          </span>
        </div>
      </div>
    </section>
  );
}
