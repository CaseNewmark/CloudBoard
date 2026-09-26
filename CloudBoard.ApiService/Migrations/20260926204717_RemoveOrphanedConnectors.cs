using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudBoard.ApiService.Migrations
{
    /// <inheritdoc />
    public partial class RemoveOrphanedConnectors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Deleting a connection used to leave its two connectors behind as stray dots on
            // the nodes. Connectors are only created when drawing a connection, so any that no
            // connection references are leftovers.
            migrationBuilder.Sql("""
                DELETE FROM "Connectors" c
                WHERE NOT EXISTS (
                    SELECT 1 FROM "Connections" x
                    WHERE x."FromConnectorId" = c."Id" OR x."ToConnectorId" = c."Id");
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Deleted leftovers can't be restored, and nothing depends on them.
        }
    }
}
