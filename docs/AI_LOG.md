# AI assistance log

AI assistance was used as an engineering collaborator. All generated suggestions were reviewed against the supplied brief before inclusion.

## Key prompts and outcomes

### 1. Requirements and scope

**Prompt summary:** Review the technical brief, public Thrive/Blackfinch context and empty repository. Propose a one-day MVP that prioritises the stated evaluation criteria.

**Accepted:** C# ASP.NET Core API, React TypeScript client, SQLite persistence, a pure decision service, an operator-facing dashboard and explicit boundary tests.

**Rejected or reduced:** Authentication, cloud infrastructure, multiple pages, charts and enterprise architectural patterns. These did not improve the required lending workflow within the timebox.

### 2. Business-rule interpretation

**Prompt summary:** Convert the natural-language lending rules into mutually exclusive conditions and identify ambiguous boundaries.

**Correction made:** The original bands overlap if read independently. The final implementation treats them as ordered ranges: `<60`, `60–<80`, `80–<90`, and `≥90`. Exactly £1 million uses the high-value branch.

**Verification:** Unit cases cover the general loan limits, the £1 million boundary, exact LTV boundaries and credit thresholds immediately below and at the required scores.

### 3. Backend design

**Prompt summary:** Keep the domain logic independent from web and persistence concerns without over-engineering a one-day exercise.

**Accepted:** A pure `LendingDecisionService`, an application orchestration service, thin controllers and EF Core persistence.

**Correction made:** SQLite cannot translate decimal `SUM` and `AVG` operations reliably. The summary query now projects only the required values and performs exact decimal aggregation in .NET.

### 4. Interface direction

**Prompt summary:** Create a professional financial workspace using human-readable type, restrained motion, attractive controls and the visual character of Thrive’s public site.

**Accepted:** A deep navy workspace, white operational surfaces, magenta actions, a small lime accent, tabular financial figures, live LTV gauge, responsive application register and reduced-motion support.

**Rejected:** Excessive gradients, animated backgrounds, glass effects across every card and decorative charts. They made the tool feel less credible.

### 5. Critical review

The final pass checked:

- Business rules remain in C# as the production source of truth.
- The browser-only mock is limited to an explicitly selected demo mode.
- Independent dashboard requests run in parallel.
- Form labels, keyboard focus, live decision announcements and error states are present.
- Dependencies are pinned and a lockfile is committed.
- The UI build and automated frontend tests complete successfully.

## Known environment limitation

The implementation environment did not contain the .NET SDK, so backend compilation could not be executed here. The projects target .NET 8 and include repeatable `dotnet restore`, `dotnet test` and `dotnet run` instructions for a clean environment.

