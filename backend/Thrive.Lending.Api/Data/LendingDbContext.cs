using Microsoft.EntityFrameworkCore;
using Thrive.Lending.Domain.Applications;

namespace Thrive.Lending.Api.Data;

public sealed class LendingDbContext(DbContextOptions<LendingDbContext> options) : DbContext(options)
{
    public DbSet<LoanApplication> LoanApplications => Set<LoanApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var application = modelBuilder.Entity<LoanApplication>();

        application.HasKey(item => item.Id);
        application.Property(item => item.LoanAmount).HasPrecision(18, 2);
        application.Property(item => item.AssetValue).HasPrecision(18, 2);
        application.Property(item => item.LoanToValue).HasPrecision(9, 4);
        application.Property(item => item.Status).HasConversion<string>().HasMaxLength(16);
        application.Property(item => item.DecisionReason).HasMaxLength(300);
        application.HasIndex(item => item.SubmittedAt);
        application.HasIndex(item => item.Status);
    }
}

