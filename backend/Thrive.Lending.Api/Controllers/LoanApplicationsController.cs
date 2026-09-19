using Microsoft.AspNetCore.Mvc;
using Thrive.Lending.Api.Contracts;
using Thrive.Lending.Api.Services;

namespace Thrive.Lending.Api.Controllers;

[ApiController]
[Route("api/applications")]
public sealed class LoanApplicationsController(LoanApplicationService service) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<LoanApplicationResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<LoanApplicationResponse>> Submit(
        [FromBody] CreateLoanApplicationRequest request,
        CancellationToken cancellationToken)
    {
        var application = await service.SubmitAsync(request, cancellationToken);
        return Created($"/api/applications/{application.Id}", application);
    }

    [HttpGet]
    [ProducesResponseType<IReadOnlyList<LoanApplicationResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<LoanApplicationResponse>>> GetRecent(
        [FromQuery] int limit = 10,
        CancellationToken cancellationToken = default) =>
        Ok(await service.GetRecentAsync(limit, cancellationToken));

    [HttpGet("{id:guid}")]
    [ProducesResponseType<LoanApplicationResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LoanApplicationResponse>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var application = await service.GetByIdAsync(id, cancellationToken);
        return application is null ? NotFound() : Ok(application);
    }
}
