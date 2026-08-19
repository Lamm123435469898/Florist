using Florist.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Florist.Infrastructure.Data.Configurations
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.Id);
            builder.Property(o => o.CustomerName).IsRequired().HasMaxLength(100);
            builder.Property(o => o.CustomerEmail).IsRequired().HasMaxLength(256);
            builder.Property(o => o.CustomerPhone).IsRequired().HasMaxLength(20);
            builder.Property(o => o.ShippingAddress).IsRequired().HasMaxLength(500);
            
            builder.Property(o => o.SubTotal).HasColumnType("decimal(18,2)");
            builder.Property(o => o.DiscountAmount).HasColumnType("decimal(18,2)");
            builder.Property(o => o.ShippingFee).HasColumnType("decimal(18,2)");
            builder.Property(o => o.FinalTotal).HasColumnType("decimal(18,2)");
            
            builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(50);

            builder.HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Voucher)
                .WithMany(v => v.Orders)
                .HasForeignKey(o => o.VoucherId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
