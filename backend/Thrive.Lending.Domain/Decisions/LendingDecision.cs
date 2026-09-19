namespace Thrive.Lending.Domain.Decisions;

public sealed record LendingDecision(
    LoanDecisionStatus Status,
    decimal LoanToValue,
    string Reason,
    int? RequiredCreditScore = null);

