import { Banknote, CheckCircle2, FileText, Percent, ShieldCheck } from "lucide-react";
import { ApplicationForm } from "../components/ApplicationForm";
import { DecisionPanel } from "../components/DecisionPanel";
import { MetricCard } from "../components/MetricCard";
import { RecentApplications } from "../components/RecentApplications";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import type { CreateLoanApplicationRequest, DashboardSummary, LoanApplication } from "../types";

interface DashboardPageProps {
  summary: DashboardSummary;
  applications: LoanApplication[];
  latestDecision: LoanApplication | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRetry: () => void;
  onSubmit: (request: CreateLoanApplicationRequest) => Promise<void>;
}

export function DashboardPage({
  summary,
  applications,
  latestDecision,
  isLoading,
  isSubmitting,
  error,
  onRetry,
  onSubmit,
}: DashboardPageProps) {
  return (
    <main id="main-content" className="dashboard" tabIndex={-1}>
      <section className="page-intro">
        <div>
          <span className="eyebrow eyebrow--lime">Secured lending</span>
          <h1>Clear decisions.<br /><span>Confident lending.</span></h1>
        </div>
        <div className="page-intro__support">
          <ShieldCheck size={22} aria-hidden="true" />
          <p>Every application is assessed consistently against loan value, LTV and credit policy.</p>
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <strong>We couldn’t complete that request.</strong>
          <span>{error}</span>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      )}

      <section className="metric-grid" aria-label="Portfolio overview">
        <MetricCard
          label="Total applicants"
          value={isLoading ? "—" : formatNumber(summary.totalApplicants)}
          supportingText="All recorded decisions"
          icon={FileText}
          delay={40}
        />
        <MetricCard
          label="Approved"
          value={isLoading ? "—" : formatNumber(summary.approvedApplicants)}
          supportingText={`${summary.declinedApplicants} declined`}
          icon={CheckCircle2}
          tone="positive"
          delay={100}
        />
        <MetricCard
          label="Loans written"
          value={isLoading ? "—" : formatCurrency(summary.totalApprovedLoanValue)}
          supportingText="Approved applications only"
          icon={Banknote}
          tone="accent"
          delay={160}
        />
        <MetricCard
          label="Mean LTV"
          value={isLoading ? "—" : formatPercent(summary.meanLoanToValue)}
          supportingText="Across all applications"
          icon={Percent}
          delay={220}
        />
      </section>

      <section className="workspace-grid">
        <ApplicationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
        <DecisionPanel application={latestDecision} />
      </section>

      <RecentApplications applications={applications} isLoading={isLoading} />
    </main>
  );
}
