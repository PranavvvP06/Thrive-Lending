namespace Thrive.Lending.Domain.Decisions;

public sealed class LendingDecisionService : ILendingDecisionService
{
    public const decimal MinimumLoanAmount = 100_000m;
    public const decimal HighValueLoanThreshold = 1_000_000m;
    public const decimal MaximumLoanAmount = 1_500_000m;

    public LendingDecision Evaluate(decimal loanAmount, decimal assetValue, int creditScore)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(loanAmount);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(assetValue);

        if (creditScore is < 1 or > 999)
        {
            throw new ArgumentOutOfRangeException(nameof(creditScore), "Credit score must be between 1 and 999.");
        }

        var ltv = loanAmount / assetValue * 100m;

        if (loanAmount < MinimumLoanAmount)
        {
            return Decline(ltv, "The loan amount is below the minimum of £100,000.");
        }

        if (loanAmount > MaximumLoanAmount)
        {
            return Decline(ltv, "The loan amount exceeds the maximum of £1,500,000.");
        }

        if (loanAmount >= HighValueLoanThreshold)
        {
            if (ltv > 60m)
            {
                return Decline(ltv, "Loans of £1 million or more require an LTV of 60% or less.");
            }

            return AssessCredit(ltv, creditScore, 950, "high-value loans with an LTV of 60% or less");
        }

        if (ltv >= 90m)
        {
            return Decline(ltv, "The requested loan represents 90% or more of the secured asset value. This exceeds the permitted LTV for facilities below £1 million.");
        }

        if (ltv < 60m)
        {
            return AssessCredit(ltv, creditScore, 750, "loans with an LTV below 60%");
        }

        if (ltv < 80m)
        {
            return AssessCredit(ltv, creditScore, 800, "loans with an LTV from 60% to below 80%");
        }

        return AssessCredit(ltv, creditScore, 900, "loans with an LTV from 80% to below 90%");
    }

    private static LendingDecision AssessCredit(decimal ltv, int creditScore, int minimumScore, string band)
    {
        if (creditScore < minimumScore)
        {
            return new LendingDecision(
                LoanDecisionStatus.Declined,
                ltv,
                $"A minimum credit score of {minimumScore} is required for {band}.",
                minimumScore);
        }

        return new LendingDecision(
            LoanDecisionStatus.Approved,
            ltv,
            $"The application meets the {minimumScore} credit score requirement for {band}.",
            minimumScore);
    }

    private static LendingDecision Decline(decimal ltv, string reason) =>
        new(LoanDecisionStatus.Declined, ltv, reason);
}
