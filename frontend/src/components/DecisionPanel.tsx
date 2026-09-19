import { CheckCircle2, CircleDashed, ShieldAlert } from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import type { LoanApplication } from "../types";

interface DecisionPanelProps {
  application: LoanApplication | null;
}

export function DecisionPanel({ application }: DecisionPanelProps) {
  if (!application) {
    return (
      <section className="decision-panel decision-panel--empty" aria-live="polite">
        <div className="empty-state__icon" aria-hidden="true">
          <CircleDashed size={26} />
        </div>
        <span className="eyebrow">Decision summary</span>
        <h2>Ready when you are</h2>
        <p>Complete the application to see the decision, policy explanation and calculated LTV.</p>
        <div className="policy-note">
          <span>Decision policy</span>
          <strong>Loan value · LTV · Credit score</strong>
        </div>
      </section>
    );
  }

  const approved = application.status === "Approved";
  const StatusIcon = approved ? CheckCircle2 : ShieldAlert;

  return (
    <section
      className={`decision-panel decision-panel--${application.status.toLowerCase()}`}
      aria-live="polite"
    >
      <div className="decision-panel__header">
        <span className="eyebrow">Decision summary</span>
        <span className={`status-pill status-pill--${application.status.toLowerCase()}`}>
          <StatusIcon size={16} />
          {application.status}
        </span>
      </div>
      <div className="decision-panel__result-icon" aria-hidden="true">
        <StatusIcon size={32} strokeWidth={1.8} />
      </div>
      <h2>{approved ? "Application approved" : "Application declined"}</h2>
      <p>{application.reason}</p>
      <dl className="decision-details">
        <div>
          <dt>Loan amount</dt>
          <dd>{formatCurrency(application.loanAmount)}</dd>
        </div>
        <div>
          <dt>Calculated LTV</dt>
          <dd>{formatPercent(application.loanToValue)}</dd>
        </div>
        <div>
          <dt>Credit score</dt>
          <dd>{formatNumber(application.creditScore)}</dd>
        </div>
      </dl>
    </section>
  );
}

