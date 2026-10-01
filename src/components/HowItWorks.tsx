const steps = [
  {
    title: "Anmäl dig",
    text: "Välj den lunch som passar.",
  },
  {
    title: "Vi ses i området",
    text: "Vi samlas och promenerar tillsammans.",
  },
  {
    title: "Lunch",
    text: "Vi äter tillsammans på en restaurang i närheten.",
  },
  {
    title: "Tillbaka till vardagen",
    text: "Lite rörelse, lunch och grannhäng på ungefär en timme.",
  },
];

export function HowItWorks() {
  return (
    <section className="band" id="hur" aria-labelledby="how-title">
      <div className="wrap">
        <h2 id="how-title">Hur funkar det?</h2>
        <ol className="steps">
          {steps.map((step, index) => (
            <li className="step" key={step.title}>
              <span className="step-no">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
