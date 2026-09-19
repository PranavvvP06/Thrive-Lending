using Microsoft.EntityFrameworkCore;
using Thrive.Lending.Api.Contracts;
using Thrive.Lending.Api.Data;
using Thrive.Lending.Domain.Applications;
using Thrive.Lending.Domain.Decisions;

namespace Thrive.Lending.Api.Services;

public sealed class LoanApplicationService(
    LendingDbContext database,
    ILendingDecisionService decisionService,
    TimeProvider timeProvider)
{
    public async Task<LoanApplicationResponse> SubmitAsync(
        CreateLoanApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var decision = decisionService.Evaluate(request.LoanAmount, request.AssetValue, request.CreditScore);
        var application = LoanApplication.Create(
            request.LoanAmount,
            request.AssetValue,
            request.CreditScore,
            decision,
            timeProvider.GetUtcNow());

        database.LoanApplications.Add(application);
        await database.SaveChangesAsync(cancellationToken);

        return LoanApplicationResponse.From(application);
    }

    public async Task<IReadOnlyList<LoanApplicationResponse>> GetRecentAsync(
        int limit,
        CancellationToken cancellationToken)
    {
        // SQLite can persist DateTimeOffset values but cannot translate ordering
        // by them. Materialize the MVP-sized register first, then order in .NET.
        var applications = await database.LoanApplications
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return applications
            .OrderByDescending(item => item.SubmittedAt)
            .Take(Math.Clamp(limit, 1, 50))
            .Select(LoanApplicationResponse.From)
            .ToList();
    }

    public async Task<LoanApplicationResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var application = await database.LoanApplications
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

        return application is null ? null : LoanApplicationResponse.From(application);
    }

    public async Task<DashboardSummaryResponse> GetSummaryAsync(CancellationToken cancellationToken)
    {
        // SQLite does not support decimal SUM/AVG translation. The projection keeps
        // the query small and lets .NET retain exact decimal arithmetic.
        var values = await database.LoanApplications
            .AsNoTracking()
            .Select(item => new { item.Status, item.LoanAmount, item.LoanToValue })
            .ToListAsync(cancellationToken);

        var totalApplicants = values.Count;
        var approvedApplicants = values.Count(item => item.Status == LoanDecisionStatus.Approved);
        var totalApprovedLoanValue = values
            .Where(item => item.Status == LoanDecisionStatus.Approved)
            .Sum(item => item.LoanAmount);
        var meanLoanToValue = values.Count == 0
            ? 0m
            : values.Average(item => item.LoanToValue);

        return new DashboardSummaryResponse(
            totalApplicants,
            approvedApplicants,
            totalApplicants - approvedApplicants,
            totalApprovedLoanValue,
            decimal.Round(meanLoanToValue, 2, MidpointRounding.AwayFromZero));
    }
}
