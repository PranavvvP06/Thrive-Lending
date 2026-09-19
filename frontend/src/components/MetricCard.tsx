import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  supportingText: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "negative" | "accent";
  delay?: number;
}

export function MetricCard({
  label,
  value,
  supportingText,
  icon: Icon,
  tone = "neutral",
  delay = 0,
}: MetricCardProps) {
  return (
    <article
      className={`metric-card metric-card--${tone}`}
      style={{ "--entry-delay": `${delay}ms` } as React.CSSProperties}
    >
      <div className="metric-card__topline">
        <span className="metric-card__label">{label}</span>
        <span className="metric-card__icon" aria-hidden="true">
          <Icon size={18} strokeWidth={2} />
        </span>
      </div>
      <strong className="metric-card__value">{value}</strong>
      <span className="metric-card__support">{supportingText}</span>
    </article>
  );
}

