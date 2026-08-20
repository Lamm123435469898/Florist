using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Florist.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddConcurrencyAndPaymentSignature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "ProductVariants",
                type: "rowversion",
                rowVersion: true,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "ProductVariants");
        }
    }
}
