import { Clock3 } from "lucide-react";
import { formatCurrency, formatPercent, formatSubmittedAt } from "../lib/format";
import type { LoanApplication } from "../types";

interface RecentApplicationsProps {
  applications: LoanApplication[];
  isLoading: boolean;
}

export function RecentApplications({ applications, isLoading }: RecentApplicationsProps) {
  return (
    <section className="recent-card">
      <div className="section-heading section-heading--table">
        <div>
          <span className="eyebrow">Application register</span>
          <h2>Recent decisions</h2>
        </div>
        <div className="updated-label">
          <Clock3 size={15} aria-hidden="true" />
          Latest first
        </div>
      </div>

      {isLoading ? (
        <div className="table-loading" aria-label="Loading recent applications">
          {[0, 1, 2].map((item) => <div className="skeleton-row" key={item} />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="table-empty">
          <p>No decisions recorded yet.</p>
          <span>Your first completed assessment will appear here.</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Submitted</th>
                <th scope="col">Loan amount</th>
                <th scope="col">Asset value</th>
                <th scope="col">LTV</th>
                <th scope="col">Credit score</th>
                <th scope="col">Decision</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={application.id}>
                  <td data-label="Submitted">{formatSubmittedAt(application.submittedAt)}</td>
                  <td data-label="Loan amount" className="table-number">{formatCurrency(application.loanAmount)}</td>
                  <td data-label="Asset value" className="table-number">{formatCurrency(application.assetValue)}</td>
                  <td data-label="LTV" className="table-number">{formatPercent(application.loanToValue)}</td>
                  <td data-label="Credit score" className="table-number">{application.creditScore}</td>
                  <td data-label="Decision">
                    <span className={`status-pill status-pill--${application.status.toLowerCase()}`}>
                      <span className="status-dot" aria-hidden="true" />
                      {application.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

