namespace Thrive.Lending.Api.Contracts;

public sealed record DashboardSummaryResponse(
    int TotalApplicants,
    int ApprovedApplicants,
    int DeclinedApplicants,
    decimal TotalApprovedLoanValue,
    decimal MeanLoanToValue);

