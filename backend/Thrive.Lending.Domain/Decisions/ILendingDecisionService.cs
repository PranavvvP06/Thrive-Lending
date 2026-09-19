namespace Thrive.Lending.Domain.Decisions;

public interface ILendingDecisionService
{
    LendingDecision Evaluate(decimal loanAmount, decimal assetValue, int creditScore);
}

