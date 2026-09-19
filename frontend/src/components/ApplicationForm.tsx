import { ArrowRight, Calculator, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { calculateLtv } from "../lib/lending";
import type { CreateLoanApplicationRequest } from "../types";
import { LtvGauge } from "./LtvGauge";

interface ApplicationFormProps {
  isSubmitting: boolean;
  onSubmit: (request: CreateLoanApplicationRequest) => Promise<void>;
}

interface FormValues {
  loanAmount: string;
  assetValue: string;
  creditScore: string;
}

export function ApplicationForm({ isSubmitting, onSubmit }: ApplicationFormProps) {
  const [values, setValues] = useState<FormValues>({
    loanAmount: "450000",
    assetValue: "650000",
    creditScore: "840",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const numericValues = {
    loanAmount: Number(values.loanAmount),
    assetValue: Number(values.assetValue),
    creditScore: Number(values.creditScore),
  };

  const ltv = calculateLtv(numericValues.loanAmount, numericValues.assetValue);

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};

    if (!Number.isFinite(numericValues.loanAmount) || numericValues.loanAmount <= 0) {
      nextErrors.loanAmount = "Enter a loan amount greater than zero.";
    }
    if (!Number.isFinite(numericValues.assetValue) || numericValues.assetValue <= 0) {
      nextErrors.assetValue = "Enter an asset value greater than zero.";
    }
    if (!Number.isInteger(numericValues.creditScore) || numericValues.creditScore < 1 || numericValues.creditScore > 999) {
      nextErrors.creditScore = "Credit score must be a whole number from 1 to 999.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    await onSubmit(numericValues);
  };

  return (
    <section className="application-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">New application</span>
          <h2>Assess lending eligibility</h2>
        </div>
        <span className="section-heading__icon" aria-hidden="true">
          <Calculator size={20} />
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <label className="field field--wide">
            <span className="field__label">Loan amount</span>
            <span className={`input-shell ${errors.loanAmount ? "input-shell--error" : ""}`}>
              <span className="input-shell__prefix">£</span>
              <input
                name="loanAmount"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="1000"
                value={values.loanAmount}
                onChange={(event) => updateValue("loanAmount", event.target.value)}
                aria-describedby="loanAmount-hint loanAmount-error"
                aria-invalid={Boolean(errors.loanAmount)}
              />
              <span className="input-shell__suffix">GBP</span>
            </span>
            <span className="field__hint" id="loanAmount-hint">Eligible range £100,000 to £1,500,000</span>
            {errors.loanAmount && <span className="field__error" id="loanAmount-error">{errors.loanAmount}</span>}
          </label>

          <label className="field field--wide">
            <span className="field__label">Secured asset value</span>
            <span className={`input-shell ${errors.assetValue ? "input-shell--error" : ""}`}>
              <span className="input-shell__prefix">£</span>
              <input
                name="assetValue"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="1000"
                value={values.assetValue}
                onChange={(event) => updateValue("assetValue", event.target.value)}
                aria-describedby="assetValue-hint assetValue-error"
                aria-invalid={Boolean(errors.assetValue)}
              />
              <span className="input-shell__suffix">GBP</span>
            </span>
            <span className="field__hint" id="assetValue-hint">Current value of the secured asset</span>
            {errors.assetValue && <span className="field__error" id="assetValue-error">{errors.assetValue}</span>}
          </label>

          <div className="field field--wide">
            <div className="field__row">
              <label className="field__label" htmlFor="creditScore">Applicant credit score</label>
              <input
                id="creditScore"
                className={`score-input ${errors.creditScore ? "score-input--error" : ""}`}
                name="creditScore"
                type="number"
                inputMode="numeric"
                min="1"
                max="999"
                step="1"
                value={values.creditScore}
                onChange={(event) => updateValue("creditScore", event.target.value)}
                aria-describedby="creditScore-hint creditScore-error"
                aria-invalid={Boolean(errors.creditScore)}
              />
            </div>
            <input
              className="score-range"
              type="range"
              min="1"
              max="999"
              step="1"
              value={Math.min(Math.max(numericValues.creditScore || 1, 1), 999)}
              onChange={(event) => updateValue("creditScore", event.target.value)}
              aria-label="Credit score"
              tabIndex={-1}
            />
            <div className="range-labels" id="creditScore-hint">
              <span>1</span>
              <span>999</span>
            </div>
            {errors.creditScore && <span className="field__error" id="creditScore-error">{errors.creditScore}</span>}
          </div>
        </div>

        <LtvGauge loanAmount={numericValues.loanAmount} ltv={ltv} />

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          <span>{isSubmitting ? "Assessing application" : "Run eligibility check"}</span>
          {isSubmitting ? (
            <LoaderCircle className="spin" size={19} aria-hidden="true" />
          ) : (
            <ArrowRight size={19} aria-hidden="true" />
          )}
        </button>
      </form>
    </section>
  );
}
