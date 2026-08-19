using Florist.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Florist.Infrastructure.Data.Configurations
{
    public class InventoryTransactionConfiguration : IEntityTypeConfiguration<InventoryTransaction>
    {
        public void Configure(EntityTypeBuilder<InventoryTransaction> builder)
        {
            builder.HasKey(it => it.Id);
            builder.Property(it => it.Type).HasConversion<string>().HasMaxLength(50);
            builder.Property(it => it.ReferenceId).HasMaxLength(100);
            builder.Property(it => it.Note).HasMaxLength(500);

            builder.HasOne(it => it.ProductVariant)
                .WithMany(pv => pv.InventoryTransactions)
                .HasForeignKey(it => it.ProductVariantId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
