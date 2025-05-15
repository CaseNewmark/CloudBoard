using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudBoard.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class FixContentAway : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "CloudBoardDocuments");

            migrationBuilder.CreateTable(
                name: "Connectors",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FromNodeId = table.Column<string>(type: "text", nullable: false),
                    ToNodeId = table.Column<string>(type: "text", nullable: false),
                    CloudBoardDocumentId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Connectors", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Connectors_CloudBoardDocuments_CloudBoardDocumentId",
                        column: x => x.CloudBoardDocumentId,
                        principalTable: "CloudBoardDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Nodes",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Position_X = table.Column<int>(type: "integer", nullable: false),
                    Position_Y = table.Column<int>(type: "integer", nullable: false),
                    CloudBoardDocumentId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Nodes_CloudBoardDocuments_CloudBoardDocumentId",
                        column: x => x.CloudBoardDocumentId,
                        principalTable: "CloudBoardDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Connectors_CloudBoardDocumentId",
                table: "Connectors",
                column: "CloudBoardDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Nodes_CloudBoardDocumentId",
                table: "Nodes",
                column: "CloudBoardDocumentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Connectors");

            migrationBuilder.DropTable(
                name: "Nodes");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "CloudBoardDocuments",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
