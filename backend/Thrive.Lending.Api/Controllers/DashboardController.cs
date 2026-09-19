using Microsoft.AspNetCore.Mvc;
using Thrive.Lending.Api.Contracts;
using Thrive.Lending.Api.Services;

namespace Thrive.Lending.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
public sealed class DashboardController(LoanApplicationService service) : ControllerBase
{
    [HttpGet("summary")]
    [ProducesResponseType<DashboardSummaryResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<DashboardSummaryResponse>> GetSummary(CancellationToken cancellationToken) =>
        Ok(await service.GetSummaryAsync(cancellationToken));
}

