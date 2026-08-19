using Florist.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Florist.Infrastructure.Data.Configurations
{
    public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
    {
        public void Configure(EntityTypeBuilder<ProductVariant> builder)
        {
            builder.HasKey(pv => pv.Id);
            builder.HasIndex(pv => pv.SKU).IsUnique();
            builder.Property(pv => pv.SKU).IsRequired().HasMaxLength(50);
            builder.Property(pv => pv.Price).IsRequired().HasColumnType("decimal(18,2)");
            builder.Property(pv => pv.Size).HasMaxLength(50);
            builder.Property(pv => pv.Color).HasMaxLength(50);

            builder.HasOne(pv => pv.Product)
                .WithMany(p => p.Variants)
                .HasForeignKey(pv => pv.ProductId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
