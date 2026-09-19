import { describeLtvBand } from "../lib/lending";
import { formatPercent } from "../lib/format";

interface LtvGaugeProps {
  loanAmount: number;
  ltv: number;
}

export function LtvGauge({ loanAmount, ltv }: LtvGaugeProps) {
  const cappedLtv = Math.min(Math.max(ltv, 0), 100);
  const band = describeLtvBand(loanAmount, ltv);
  const formattedLtv = formatPercent(ltv);
  const ratio = ltv / 100;
  const explanation = ltv > 100
    ? `The requested loan is ${ratio.toLocaleString("en-GB", { maximumFractionDigits: 2 })}× the secured asset value.`
    : `The requested loan represents ${formattedLtv} of the secured asset value.`;
  const valueSize = formattedLtv.length >= 10 ? "compact" : formattedLtv.length >= 8 ? "small" : "standard";

  return (
    <div className="ltv-gauge" aria-label={`Loan to value ${formattedLtv}. ${band}. ${explanation}`}>
      <div
        className="ltv-gauge__ring"
        style={{ "--gauge-value": `${cappedLtv * 3.6}deg` } as React.CSSProperties}
        aria-hidden="true"
      >
        <div className="ltv-gauge__centre">
          <span>LTV</span>
        </div>
      </div>
      <div className="ltv-gauge__content">
        <span className="eyebrow">Live loan-to-value</span>
        <strong className={`ltv-gauge__value ltv-gauge__value--${valueSize}`}>{formattedLtv}</strong>
        <p className="ltv-gauge__band">{band}</p>
        <p className="ltv-gauge__explanation">{explanation}</p>
      </div>
    </div>
  );
}
