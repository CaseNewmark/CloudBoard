using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudBoard.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class ProperNaming : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ToNodeId",
                table: "Connectors",
                newName: "ToConnectorId");

            migrationBuilder.RenameColumn(
                name: "FromNodeId",
                table: "Connectors",
                newName: "FromConnectorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ToConnectorId",
                table: "Connectors",
                newName: "ToNodeId");

            migrationBuilder.RenameColumn(
                name: "FromConnectorId",
                table: "Connectors",
                newName: "FromNodeId");
        }
    }
}
