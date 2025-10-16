using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlFichajesAPI.Migrations
{
    /// <inheritdoc />
    public partial class Configure_Keys_And_Indexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Incidencias_IdUsuario",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Fichajes_IdUsuario",
                table: "Fichajes");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_IdUsuario_FechaReporte",
                table: "Incidencias",
                columns: new[] { "IdUsuario", "FechaReporte" });

            migrationBuilder.CreateIndex(
                name: "IX_Fichajes_IdUsuario_Fecha",
                table: "Fichajes",
                columns: new[] { "IdUsuario", "Fecha" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Incidencias_IdUsuario_FechaReporte",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Fichajes_IdUsuario_Fecha",
                table: "Fichajes");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_IdUsuario",
                table: "Incidencias",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Fichajes_IdUsuario",
                table: "Fichajes",
                column: "IdUsuario");
        }
    }
}
