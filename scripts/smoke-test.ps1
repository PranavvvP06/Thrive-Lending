$ErrorActionPreference = "Stop"

$apiBaseUrl = "http://localhost:5168"

Write-Host "Checking API health..." -ForegroundColor Cyan
$health = Invoke-RestMethod -Uri "$apiBaseUrl/health"
if ($health.status -ne "healthy") {
    throw "Health endpoint did not report healthy."
}

Write-Host "Reading dashboard summary..." -ForegroundColor Cyan
$summaryBefore = Invoke-RestMethod -Uri "$apiBaseUrl/api/dashboard/summary"

Write-Host "Submitting a valid lending application..." -ForegroundColor Cyan
$requestBody = @{
    loanAmount = 450000
    assetValue = 650000
    creditScore = 840
} | ConvertTo-Json -Compress

$created = Invoke-RestMethod `
    -Uri "$apiBaseUrl/api/applications" `
    -Method Post `
    -ContentType "application/json" `
    -Body $requestBody

if (-not $created.id -or $created.status -ne "Approved") {
    throw "The API did not return the expected approved application."
}

Write-Host "Checking recent applications..." -ForegroundColor Cyan
$recent = @(Invoke-RestMethod -Uri "$apiBaseUrl/api/applications?limit=10")
if ($recent.Count -lt 1 -or $recent[0].id -ne $created.id) {
    throw "The newly created application was not returned first in the register."
}

Write-Host "Checking updated dashboard totals..." -ForegroundColor Cyan
$summaryAfter = Invoke-RestMethod -Uri "$apiBaseUrl/api/dashboard/summary"
if ($summaryAfter.totalApplicants -ne ($summaryBefore.totalApplicants + 1)) {
    throw "The total applicant count did not increase after submission."
}

Write-Host "Smoke test passed." -ForegroundColor Green
Write-Host "Created application: $($created.id)"
Write-Host "Decision: $($created.status)"
Write-Host "LTV: $($created.loanToValue)%"
Write-Host "Applicants before/after: $($summaryBefore.totalApplicants) -> $($summaryAfter.totalApplicants)"
