using Thrive.Lending.Domain.Decisions;

namespace Thrive.Lending.Tests;

public sealed class LendingDecisionServiceTests
{
    private readonly LendingDecisionService _service = new();

    [Theory]
    [InlineData(99_999, 200_000, 999)]
    [InlineData(1_500_001, 3_000_000, 999)]
    public void Evaluate_DeclinesLoansOutsideGeneralLimits(
        decimal loanAmount,
        decimal assetValue,
        int creditScore)
    {
        var result = _service.Evaluate(loanAmount, assetValue, creditScore);

        Assert.Equal(LoanDecisionStatus.Declined, result.Status);
    }

    [Theory]
    [InlineData(100_000, 200_000, 750)]
    [InlineData(999_999, 2_000_000, 750)]
    [InlineData(1_000_000, 2_000_000, 950)]
    [InlineData(1_500_000, 3_000_000, 950)]
    public void Evaluate_AllowsInclusiveLoanBoundariesWhenOtherRulesPass(
        decimal loanAmount,
        decimal assetValue,
        int creditScore)
    {
        var result = _service.Evaluate(loanAmount, assetValue, creditScore);

        Assert.Equal(LoanDecisionStatus.Approved, result.Status);
    }

    [Theory]
    [InlineData(500_000, 1_000_000, 750, LoanDecisionStatus.Approved)]
    [InlineData(500_000, 1_000_000, 749, LoanDecisionStatus.Declined)]
    [InlineData(600_000, 1_000_000, 800, LoanDecisionStatus.Approved)]
    [InlineData(600_000, 1_000_000, 799, LoanDecisionStatus.Declined)]
    [InlineData(800_000, 1_000_000, 900, LoanDecisionStatus.Approved)]
    [InlineData(800_000, 1_000_000, 899, LoanDecisionStatus.Declined)]
    [InlineData(900_000, 1_000_000, 999, LoanDecisionStatus.Declined)]
    public void Evaluate_AppliesLowValueLtvAndCreditBands(
        decimal loanAmount,
        decimal assetValue,
        int creditScore,
        LoanDecisionStatus expectedStatus)
    {
        var result = _service.Evaluate(loanAmount, assetValue, creditScore);

        Assert.Equal(expectedStatus, result.Status);
    }

    [Theory]
    [InlineData(1_000_000, 1_666_666.67, 950, LoanDecisionStatus.Approved)]
    [InlineData(1_000_000, 1_666_666.67, 949, LoanDecisionStatus.Declined)]
    [InlineData(1_000_000, 1_600_000, 999, LoanDecisionStatus.Declined)]
    public void Evaluate_AppliesHighValueLoanRules(
        decimal loanAmount,
        decimal assetValue,
        int creditScore,
        LoanDecisionStatus expectedStatus)
    {
        var result = _service.Evaluate(loanAmount, assetValue, creditScore);

        Assert.Equal(expectedStatus, result.Status);
    }

    [Fact]
    public void Evaluate_CalculatesLoanToValue()
    {
        var result = _service.Evaluate(450_000m, 650_000m, 850);

        Assert.InRange(result.LoanToValue, 69.2307m, 69.2308m);
    }

    [Theory]
    [InlineData(0, 500_000, 750)]
    [InlineData(-1, 500_000, 750)]
    [InlineData(100_000, 0, 750)]
    [InlineData(100_000, -1, 750)]
    public void Evaluate_RejectsNonPositiveMoneyValues(
        decimal loanAmount,
        decimal assetValue,
        int creditScore)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            _service.Evaluate(loanAmount, assetValue, creditScore));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1000)]
    public void Evaluate_RejectsCreditScoresOutsideRange(int creditScore)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            _service.Evaluate(100_000m, 200_000m, creditScore));
    }
}
