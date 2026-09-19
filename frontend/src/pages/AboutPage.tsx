import { Calculator, Database, Scale, ShieldCheck } from "lucide-react";

const policyRows = [
  ["Below £100,000", "Any", "Not applicable", "Declined"],
  ["£100,000–£999,999.99", "Below 60%", "750", "Credit assessed"],
  ["£100,000–£999,999.99", "60%–below 80%", "800", "Credit assessed"],
  ["£100,000–£999,999.99", "80%–below 90%", "900", "Credit assessed"],
  ["£100,000–£999,999.99", "90% or above", "Not applicable", "Declined"],
  ["£1,000,000–£1,500,000", "60% or below", "950", "Credit assessed"],
  ["£1,000,000–£1,500,000", "Above 60%", "Not applicable", "Declined"],
  ["Above £1,500,000", "Any", "Not applicable", "Declined"],
];

export function AboutPage() {
  return (
    <main id="main-content" className="dashboard dashboard--subpage" tabIndex={-1}>
      <section className="subpage-intro subpage-intro--about">
        <span className="eyebrow eyebrow--lime">About the service</span>
        <h1>Transparent decisions, backed by explicit policy.</h1>
        <p>Thrive Lending is a secured-lending decision MVP built to make every outcome consistent, explainable and auditable.</p>
      </section>

      <section className="about-grid">
        <article className="about-card about-card--lead">
          <span className="about-card__icon" aria-hidden="true"><ShieldCheck size={22} /></span>
          <span className="eyebrow">Purpose</span>
          <h2>A clear assessment from three inputs</h2>
          <p>The service evaluates the requested loan amount, the current secured asset value and the applicant’s credit score. It calculates LTV, selects the applicable policy band and returns a decision with a plain-English rationale.</p>
        </article>
        <article className="about-card">
          <span className="about-card__icon" aria-hidden="true"><Calculator size={22} /></span>
          <span className="eyebrow">Calculation</span>
          <h2>Loan-to-value</h2>
          <div className="formula">LTV = loan amount ÷ asset value × 100</div>
          <p>Policy comparisons use the unrounded value. Rounding to two decimal places is applied only when results are displayed.</p>
        </article>
        <article className="about-card">
          <span className="about-card__icon" aria-hidden="true"><Database size={22} /></span>
          <span className="eyebrow">Traceability</span>
          <h2>Persistent decision register</h2>
          <p>Every completed assessment is stored in SQLite with its inputs, outcome, explanation, required score and submission time.</p>
        </article>
      </section>

      <section className="policy-card">
        <div className="section-heading section-heading--table">
          <div>
            <span className="eyebrow">Decision framework</span>
            <h2>Lending policy matrix</h2>
          </div>
          <span className="policy-card__mark" aria-hidden="true"><Scale size={21} /></span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Loan amount</th>
                <th scope="col">LTV</th>
                <th scope="col">Minimum score</th>
                <th scope="col">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {policyRows.map(([amount, ltv, score, outcome]) => (
                <tr key={`${amount}-${ltv}`}>
                  <td data-label="Loan amount">{amount}</td>
                  <td data-label="LTV">{ltv}</td>
                  <td data-label="Minimum score">{score}</td>
                  <td data-label="Outcome"><strong>{outcome}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="architecture-card">
        <div>
          <span className="architecture-card__number">01</span>
          <h3>Capture</h3>
          <p>React validates and submits the application inputs.</p>
        </div>
        <div>
          <span className="architecture-card__number">02</span>
          <h3>Decide</h3>
          <p>The C# domain service calculates LTV and applies policy.</p>
        </div>
        <div>
          <span className="architecture-card__number">03</span>
          <h3>Record</h3>
          <p>Entity Framework stores the result in SQLite for reporting.</p>
        </div>
      </section>
    </main>
  );
}
