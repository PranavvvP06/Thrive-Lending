using Thrive.Lending.Domain.Applications;

namespace Thrive.Lending.Api.Contracts;

public sealed record LoanApplicationResponse(
    Guid Id,
    decimal LoanAmount,
    decimal AssetValue,
    int CreditScore,
    decimal LoanToValue,
    string Status,
    string Reason,
    int? RequiredCreditScore,
    DateTimeOffset SubmittedAt)
{
    public static LoanApplicationResponse From(LoanApplication application) =>
        new(
            application.Id,
            application.LoanAmount,
            application.AssetValue,
            application.CreditScore,
            decimal.Round(application.LoanToValue, 2, MidpointRounding.AwayFromZero),
            application.Status.ToString(),
            application.DecisionReason,
            application.RequiredCreditScore,
            application.SubmittedAt);
}

