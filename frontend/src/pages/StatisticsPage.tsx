import { Banknote, CheckCircle2, FileBarChart, Gauge, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecentApplications } from "../api/lendingApi";
import { MetricCard } from "../components/MetricCard";
import { formatCurrency, formatNumber, formatPercent } from "../lib/format";
import type { DashboardSummary, LoanApplication } from "../types";

interface StatisticsPageProps {
  summary: DashboardSummary;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short" });
const monthYearFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `£${Math.round(value / 1_000)}k`;
  return `£${Math.round(value)}`;
};

const percentage = (count: number, total: number) => total > 0 ? (count / total) * 100 : 0;

export function StatisticsPage({ summary, isLoading, error, onRetry }: StatisticsPageProps) {
  const [recentApplications, setRecentApplications] = useState<LoanApplication[]>([]);
  const [isRegisterLoading, setIsRegisterLoading] = useState(true);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    getRecentApplications(50)
      .then((applications) => {
        if (!isActive) return;
        setRecentApplications(applications);
        setRegisterError(null);
      })
      .catch((requestError) => {
        if (!isActive) return;
        setRegisterError(requestError instanceof Error ? requestError.message : "Recent data could not be loaded.");
      })
      .finally(() => {
        if (isActive) setIsRegisterLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const approvalRate = summary.totalApplicants > 0
    ? (summary.approvedApplicants / summary.totalApplicants) * 100
    : 0;
  const recentTotal = recentApplications.length;
  const recentApproved = recentApplications.filter((application) => application.status === "Approved");
  const averageApprovedLtv = recentApproved.length > 0
    ? recentApproved.reduce((total, application) => total + application.loanToValue, 0) / recentApproved.length
    : 0;
  const orderedScores = recentApplications.map((application) => application.creditScore).sort((a, b) => a - b);
  const medianCreditScore = orderedScores.length === 0
    ? null
    : orderedScores.length % 2 === 1
      ? orderedScores[Math.floor(orderedScores.length / 2)]
      : Math.round((orderedScores[orderedScores.length / 2 - 1] + orderedScores[orderedScores.length / 2]) / 2);
  const rationaleCoverage = percentage(
    recentApplications.filter((application) => application.reason.trim().length > 0).length,
    recentTotal,
  );

  const ltvBands = [
    { label: "Below 60%", count: recentApplications.filter((item) => item.loanToValue < 60).length, tone: "green" },
    { label: "60% to below 80%", count: recentApplications.filter((item) => item.loanToValue >= 60 && item.loanToValue < 80).length, tone: "navy" },
    { label: "80% to below 90%", count: recentApplications.filter((item) => item.loanToValue >= 80 && item.loanToValue < 90).length, tone: "magenta" },
    { label: "90% and above", count: recentApplications.filter((item) => item.loanToValue >= 90).length, tone: "red" },
  ].map((band) => ({ ...band, value: percentage(band.count, recentTotal) }));

  const currentMonth = new Date();
  const monthlyVolumes = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - index), 1);
    const applications = recentApproved.filter((application) => {
      const submittedAt = new Date(application.submittedAt);
      return submittedAt.getFullYear() === monthDate.getFullYear()
        && submittedAt.getMonth() === monthDate.getMonth();
    });

    return {
      key: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      month: monthFormatter.format(monthDate),
      fullMonth: monthYearFormatter.format(monthDate),
      value: applications.reduce((total, application) => total + application.loanAmount, 0),
      count: applications.length,
      isCurrent: index === 5,
    };
  });
  const maximumMonthlyVolume = Math.max(...monthlyVolumes.map((month) => month.value), 1);

  return (
    <main id="main-content" className="dashboard dashboard--subpage" tabIndex={-1}>
      <section className="subpage-intro">
        <span className="eyebrow eyebrow--lime">Portfolio intelligence</span>
        <h1>Statistics</h1>
        <p>Live application totals and recent portfolio trends from the SQLite decision register.</p>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <strong>Live statistics are temporarily unavailable.</strong>
          <span>{error}</span>
          <button type="button" onClick={onRetry}>Try again</button>
        </div>
      )}

      <section className="metric-grid" aria-label="Live portfolio statistics">
        <MetricCard
          label="Applications"
          value={isLoading ? "—" : formatNumber(summary.totalApplicants)}
          supportingText="Live from SQLite"
          icon={FileBarChart}
        />
        <MetricCard
          label="Approval rate"
          value={isLoading ? "—" : formatPercent(approvalRate)}
          supportingText="Based on recorded decisions"
          icon={CheckCircle2}
          tone="positive"
        />
        <MetricCard
          label="Approved value"
          value={isLoading ? "—" : formatCurrency(summary.totalApprovedLoanValue)}
          supportingText="Live approved principal"
          icon={Banknote}
          tone="accent"
        />
        <MetricCard
          label="Mean LTV"
          value={isLoading ? "—" : formatPercent(summary.meanLoanToValue)}
          supportingText="Approved and declined"
          icon={Gauge}
        />
      </section>

      <div className="sample-notice" role="note">
        <Info size={18} aria-hidden="true" />
        <p><strong>Live portfolio view:</strong> the charts below update from the 50 most recent recorded decisions. Hover over or focus a monthly bar to inspect its value and approved application count.</p>
      </div>

      {registerError && <div className="inline-error" role="alert">{registerError}</div>}

      <section className="insights-grid" aria-label="Live recent portfolio charts">
        <article className="insight-card">
          <div className="insight-card__header">
            <div>
              <span className="eyebrow">Risk distribution</span>
              <h2>Applications by LTV band</h2>
            </div>
            <span className="sample-badge">Live · recent 50</span>
          </div>
          <div className="band-chart">
            {ltvBands.map((band) => (
              <div className="band-chart__row" key={band.label}>
                <div className="band-chart__label">
                  <span>{band.label}</span>
                  <strong>{isRegisterLoading ? "—" : `${band.value.toFixed(1)}% · ${band.count}`}</strong>
                </div>
                <div className="band-chart__track" aria-hidden="true">
                  <span
                    className={`band-chart__fill band-chart__fill--${band.tone}`}
                    style={{ width: `${band.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="insight-card">
          <div className="insight-card__header">
            <div>
              <span className="eyebrow">Written volume</span>
              <h2>Six-month lending trend</h2>
            </div>
            <span className="sample-badge">Live · approved</span>
          </div>
          <div className="volume-chart" aria-label="Approved lending value over the most recent six months">
            {monthlyVolumes.map((month) => (
              <button
                type="button"
                className="volume-chart__column"
                key={month.key}
                aria-label={`${month.fullMonth}: ${formatCurrency(month.value)} across ${month.count} approved ${month.count === 1 ? "application" : "applications"}`}
              >
                <span className="volume-chart__tooltip" role="tooltip">
                  <strong>{month.fullMonth}</strong>
                  <span>{formatCurrency(month.value)}</span>
                  <small>{month.count} approved {month.count === 1 ? "application" : "applications"}</small>
                </span>
                <strong>{isRegisterLoading ? "—" : formatCompactCurrency(month.value)}</strong>
                <div className="volume-chart__track" aria-hidden="true">
                  <span style={{ height: `${month.value > 0 ? Math.max((month.value / maximumMonthlyVolume) * 100, 5) : 0}%` }} />
                </div>
                <span>{month.month}{month.isCurrent && <small>Current</small>}</span>
              </button>
            ))}
          </div>
        </article>

        <article className="insight-card insight-card--wide">
          <div className="insight-card__header">
            <div>
              <span className="eyebrow">Decision quality</span>
              <h2>Recent operating indicators</h2>
            </div>
            <span className="sample-badge">Live · recent 50</span>
          </div>
          <div className="indicator-grid">
            <div><strong>{isRegisterLoading ? "—" : formatPercent(percentage(recentApproved.length, recentTotal))}</strong><span>Recent approval rate</span></div>
            <div><strong>{isRegisterLoading ? "—" : formatPercent(averageApprovedLtv)}</strong><span>Average approved LTV</span></div>
            <div><strong>{isRegisterLoading ? "—" : medianCreditScore ?? "—"}</strong><span>Median credit score</span></div>
            <div><strong>{isRegisterLoading ? "—" : formatPercent(rationaleCoverage)}</strong><span>Decisions with rationale</span></div>
          </div>
        </article>
      </section>
    </main>
  );
}
