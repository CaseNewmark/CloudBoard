using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudBoard.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class CloudBoardMembers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CloudBoardMembers",
                columns: table => new
                {
                    CloudBoardDocumentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CloudBoardMembers", x => new { x.CloudBoardDocumentId, x.Email });
                    table.ForeignKey(
                        name: "FK_CloudBoardMembers_CloudBoardDocuments_CloudBoardDocumentId",
                        column: x => x.CloudBoardDocumentId,
                        principalTable: "CloudBoardDocuments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CloudBoardMembers_Email",
                table: "CloudBoardMembers",
                column: "Email");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CloudBoardMembers");
        }
    }
}
