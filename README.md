# Thrive Lending

A focused full-stack lending decision system built for the Blackfinch engineering technical test. The application assesses secured-loan eligibility, records every decision and presents live portfolio metrics through a professional three-page interface.

## Technology

- **API:** C# 12, ASP.NET Core 8 and Swagger
- **Domain:** framework-independent lending decision service
- **Persistence:** Entity Framework Core with SQLite
- **Web:** React 19, TypeScript and Vite
- **Tests:** xUnit, Vitest and React Testing Library

## Run locally

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- Node.js 22 or later

### 1. Start the API

```bash
dotnet restore
dotnet run --project backend/Thrive.Lending.Api
```

The API runs at `http://localhost:5168`. In development, Swagger is available at `http://localhost:5168/swagger`.

The SQLite database is created automatically on first run at `backend/Thrive.Lending.Api/thrive-lending.db`.

### 2. Start the web application

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

For a standalone UI demonstration without the C# API, run `npm run dev:demo`. Demo mode uses browser storage and is never enabled in the production build.

## Application pages

- **Dashboard:** live portfolio metrics, lending assessment form, explainable decision result and recent applications stored in SQLite.
- **Statistics:** live database totals plus clearly labelled illustrative portfolio charts for presentation and review.
- **About:** system purpose, LTV calculation, complete policy matrix, persistence approach and end-to-end processing flow.

The Statistics page deliberately separates live figures from illustrative sample data so demonstration charts cannot be mistaken for persisted lending records.

## Test and build

```bash
dotnet test

cd frontend
npm test
npm run build
```

With the API running, the end-to-end PowerShell smoke test verifies health, submission, SQLite persistence, recent ordering and dashboard aggregation:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

## Business rules

LTV is calculated as:

```text
Loan to Value = (loan amount / secured asset value) × 100
```

| Loan amount | LTV | Minimum credit score | Result |
|---|---:|---:|---|
| Below £100,000 | Any | N/A | Declined |
| Above £1,500,000 | Any | N/A | Declined |
| £1,000,000–£1,500,000 | ≤ 60% | 950 | Credit assessed |
| £1,000,000–£1,500,000 | > 60% | N/A | Declined |
| £100,000–£999,999.99 | < 60% | 750 | Credit assessed |
| £100,000–£999,999.99 | 60%–< 80% | 800 | Credit assessed |
| £100,000–£999,999.99 | 80%–< 90% | 900 | Credit assessed |
| £100,000–£999,999.99 | ≥ 90% | N/A | Declined |

Policy boundaries are evaluated using the unrounded decimal LTV. The API rounds LTV to two decimal places only when returning it for display.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/applications` | Assess and record a loan application |
| `GET` | `/api/applications?limit=10` | Return recent applications |
| `GET` | `/api/applications/{id}` | Return a single application |
| `GET` | `/api/dashboard/summary` | Return grouped counts and portfolio metrics |
| `GET` | `/health` | Service health check |

Example request:

```json
{
  "loanAmount": 450000,
  "assetValue": 650000,
  "creditScore": 840
}
```

## Architecture

```text
React dashboard
      │ HTTP/JSON
      ▼
ASP.NET Core controllers
      │
      ├── LoanApplicationService ── Entity Framework Core ── SQLite
      │
      └── LendingDecisionService (pure domain logic)
```

The lending rules live in `Thrive.Lending.Domain` and do not depend on ASP.NET Core or Entity Framework. This keeps policy behaviour easy to review and test. The API project owns transport, persistence and aggregation. The React application only presents data and captures input; the C# backend remains the source of truth for real decisions.

## Dashboard metric definitions

- **Approved and declined applicants:** all persisted valid applications grouped by decision status.
- **Total loans written:** the sum of approved loan amounts only.
- **Mean LTV:** arithmetic mean of LTV across all persisted applications, including declined applications.

Additional decisions and trade-offs are documented in [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md). AI-assisted development notes are in [docs/AI_LOG.md](docs/AI_LOG.md).

## Production considerations

For a production service I would replace `EnsureCreated` with versioned database migrations, use a managed database, add authentication and authorisation, introduce structured audit events and idempotency, add rate limiting and observability, and paginate the application register. Those concerns were intentionally excluded from this one-day MVP.
