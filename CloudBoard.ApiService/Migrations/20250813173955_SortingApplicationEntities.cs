using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudBoard.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class SortingApplicationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarketSegments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SegmentCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    SegmentName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Country = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    BusinessUnit = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SortingApplications",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedBy = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SortingApplications", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TargetMaterials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MaterialCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    MaterialName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Color = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Form = table.Column<int>(type: "integer", nullable: false),
                    IsContaminant = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TargetMaterials", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProcessSteps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProcessStepId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StepCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    ProcessStepName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StepType = table.Column<int>(type: "integer", nullable: false),
                    InfeedMaterialDescription = table.Column<string>(type: "text", nullable: false),
                    MainMaterialForEjection = table.Column<string>(type: "text", nullable: false),
                    ConflictingMaterials = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    SortingApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    MarketSegmentId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessSteps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProcessSteps_MarketSegments_MarketSegmentId",
                        column: x => x.MarketSegmentId,
                        principalTable: "MarketSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcessSteps_SortingApplications_SortingApplicationId",
                        column: x => x.SortingApplicationId,
                        principalTable: "SortingApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MarketSegmentTargetMaterials",
                columns: table => new
                {
                    MarketSegmentsId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetMaterialsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketSegmentTargetMaterials", x => new { x.MarketSegmentsId, x.TargetMaterialsId });
                    table.ForeignKey(
                        name: "FK_MarketSegmentTargetMaterials_MarketSegments_MarketSegmentsId",
                        column: x => x.MarketSegmentsId,
                        principalTable: "MarketSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MarketSegmentTargetMaterials_TargetMaterials_TargetMaterial~",
                        column: x => x.TargetMaterialsId,
                        principalTable: "TargetMaterials",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProcessStepTargetMaterials",
                columns: table => new
                {
                    ProcessStepsId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetMaterialsId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProcessStepTargetMaterials", x => new { x.ProcessStepsId, x.TargetMaterialsId });
                    table.ForeignKey(
                        name: "FK_ProcessStepTargetMaterials_ProcessSteps_ProcessStepsId",
                        column: x => x.ProcessStepsId,
                        principalTable: "ProcessSteps",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProcessStepTargetMaterials_TargetMaterials_TargetMaterialsId",
                        column: x => x.TargetMaterialsId,
                        principalTable: "TargetMaterials",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketSegmentTargetMaterials_TargetMaterialsId",
                table: "MarketSegmentTargetMaterials",
                column: "TargetMaterialsId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessSteps_MarketSegmentId",
                table: "ProcessSteps",
                column: "MarketSegmentId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessSteps_SortingApplicationId",
                table: "ProcessSteps",
                column: "SortingApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProcessStepTargetMaterials_TargetMaterialsId",
                table: "ProcessStepTargetMaterials",
                column: "TargetMaterialsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketSegmentTargetMaterials");

            migrationBuilder.DropTable(
                name: "ProcessStepTargetMaterials");

            migrationBuilder.DropTable(
                name: "ProcessSteps");

            migrationBuilder.DropTable(
                name: "TargetMaterials");

            migrationBuilder.DropTable(
                name: "MarketSegments");

            migrationBuilder.DropTable(
                name: "SortingApplications");
        }
    }
}
