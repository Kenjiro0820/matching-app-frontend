export default function StatusView({ eyebrow, title, description, action }) {
  return (
    <section className="surface-card status-view">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-description">{description}</p> : null}
      {action ? <div className="status-view__action">{action}</div> : null}
    </section>
  );
}
