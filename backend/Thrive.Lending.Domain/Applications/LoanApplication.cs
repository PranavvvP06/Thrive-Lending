using Thrive.Lending.Domain.Decisions;

namespace Thrive.Lending.Domain.Applications;

public sealed class LoanApplication
{
    private LoanApplication()
    {
    }

    private LoanApplication(
        Guid id,
        decimal loanAmount,
        decimal assetValue,
        int creditScore,
        LendingDecision decision,
        DateTimeOffset submittedAt)
    {
        Id = id;
        LoanAmount = loanAmount;
        AssetValue = assetValue;
        CreditScore = creditScore;
        LoanToValue = decision.LoanToValue;
        Status = decision.Status;
        DecisionReason = decision.Reason;
        RequiredCreditScore = decision.RequiredCreditScore;
        SubmittedAt = submittedAt;
    }

    public Guid Id { get; private set; }
    public decimal LoanAmount { get; private set; }
    public decimal AssetValue { get; private set; }
    public int CreditScore { get; private set; }
    public decimal LoanToValue { get; private set; }
    public LoanDecisionStatus Status { get; private set; }
    public string DecisionReason { get; private set; } = string.Empty;
    public int? RequiredCreditScore { get; private set; }
    public DateTimeOffset SubmittedAt { get; private set; }

    public static LoanApplication Create(
        decimal loanAmount,
        decimal assetValue,
        int creditScore,
        LendingDecision decision,
        DateTimeOffset submittedAt) =>
        new(Guid.NewGuid(), loanAmount, assetValue, creditScore, decision, submittedAt);
}

