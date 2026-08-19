using Florist.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Florist.Infrastructure.Data.Configurations
{
    public class VoucherConfiguration : IEntityTypeConfiguration<Voucher>
    {
        public void Configure(EntityTypeBuilder<Voucher> builder)
        {
            builder.HasKey(v => v.Id);
            builder.HasIndex(v => v.Code).IsUnique();
            builder.Property(v => v.Code).IsRequired().HasMaxLength(50);
            
            builder.Property(v => v.DiscountType).HasConversion<string>().HasMaxLength(50);
            builder.Property(v => v.Status).HasConversion<string>().HasMaxLength(50);
            
            builder.Property(v => v.DiscountValue).HasColumnType("decimal(18,2)");
            builder.Property(v => v.MinimumOrderValue).HasColumnType("decimal(18,2)");
            builder.Property(v => v.MaximumDiscount).HasColumnType("decimal(18,2)");
        }
    }
}
