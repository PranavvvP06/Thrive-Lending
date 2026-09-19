using System.ComponentModel.DataAnnotations;

namespace Thrive.Lending.Api.Contracts;

public sealed class CreateLoanApplicationRequest
{
    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "Loan amount must be greater than zero.")]
    public decimal LoanAmount { get; init; }

    [Range(typeof(decimal), "0.01", "999999999.99", ErrorMessage = "Asset value must be greater than zero.")]
    public decimal AssetValue { get; init; }

    [Range(1, 999, ErrorMessage = "Credit score must be between 1 and 999.")]
    public int CreditScore { get; init; }
}
