interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow reveal-up">
        <span className="text-muted">{index}</span>
        <span className="h-px w-6 bg-brand-300" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="display-2 mt-4 reveal-up">{title}</h2>
      {description && <p className="lead mt-4 reveal-up">{description}</p>}
    </div>
  );
}
