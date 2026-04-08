export default function PageIntro({ eyebrow, title, description, aside }) {
  return (
    <section className="page-intro surface-card">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-description">{description}</p> : null}
      </div>
      {aside ? <div className="page-intro__aside">{aside}</div> : null}
    </section>
  );
}
