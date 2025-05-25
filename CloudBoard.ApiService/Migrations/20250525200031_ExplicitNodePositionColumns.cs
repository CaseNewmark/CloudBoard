using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudBoard.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class ExplicitNodePositionColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Position_Y",
                table: "Nodes",
                newName: "PositionY");

            migrationBuilder.RenameColumn(
                name: "Position_X",
                table: "Nodes",
                newName: "PositionX");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PositionY",
                table: "Nodes",
                newName: "Position_Y");

            migrationBuilder.RenameColumn(
                name: "PositionX",
                table: "Nodes",
                newName: "Position_X");
        }
    }
}
