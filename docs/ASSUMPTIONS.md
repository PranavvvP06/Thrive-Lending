# Assumptions and decisions

## Rule boundaries

The brief uses overlapping natural-language LTV bands. They are interpreted as ordered, non-overlapping ranges:

- Exactly 60% uses the 60% to below 80% band for loans below £1 million.
- Exactly 80% uses the 80% to below 90% band.
- Exactly 90% is declined.
- Exactly £1 million uses the high-value loan rules.
- Exactly £100,000 and £1.5 million are inside the permitted general range.

Rule decisions use the full decimal LTV rather than a value rounded for display.

## Validation versus decline

Malformed values are validation failures rather than lending decisions. A loan or asset value that is zero or negative, or a credit score outside 1–999, returns HTTP 400 and is not stored. A valid application outside the permitted lending policy is stored as declined.

## Metrics

“Loans written” is interpreted as approved loans because declined applications are not written. “Mean average LTV across all applications” includes both approved and declined valid applications.

## Persistence

SQLite provides durable local data while keeping setup suitable for a technical exercise. `Database.EnsureCreated()` avoids a migration step for the MVP. A production service would use reviewed EF Core migrations and an externally managed relational database.

## User experience

The interface is a working lending surface rather than a marketing page. The assessment form is prefilled with an editable representative example so the evaluator can exercise the complete flow immediately. The interface displays the reason behind every decision to make the policy auditable.

The visual language takes restrained inspiration from Thrive’s public navy, magenta and lime palette. No proprietary logo or production identity is reproduced.

## Deliberate exclusions

- Authentication and user management
- Third-party credit checks
- Document uploads
- Multiple lending products
- Loan repayment schedules
- Rule administration
- Notifications
- Cloud deployment infrastructure

