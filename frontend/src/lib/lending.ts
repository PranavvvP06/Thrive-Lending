export const calculateLtv = (loanAmount: number, assetValue: number) =>
  loanAmount > 0 && assetValue > 0 ? (loanAmount / assetValue) * 100 : 0;

export const describeLtvBand = (loanAmount: number, ltv: number) => {
  if (loanAmount >= 1_000_000) return ltv <= 60 ? "Within high-value lending limit" : "Above 60% high-value limit";
  if (ltv < 60) return "Lower leverage";
  if (ltv < 80) return "Moderate leverage";
  if (ltv < 90) return "Higher leverage";
  return "Above maximum permitted LTV";
};
