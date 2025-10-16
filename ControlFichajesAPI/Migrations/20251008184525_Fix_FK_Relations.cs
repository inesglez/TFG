using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlFichajesAPI.Migrations
{
    /// <inheritdoc />
    public partial class Fix_FK_Relations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fichajes_Usuarios_UsuarioId_Usuario",
                table: "Fichajes");

            migrationBuilder.DropForeignKey(
                name: "FK_Incidencias_Fichajes_FichajeId_Fichaje",
                table: "Incidencias");

            migrationBuilder.DropForeignKey(
                name: "FK_Incidencias_Usuarios_UsuarioId_Usuario",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Incidencias_FichajeId_Fichaje",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Incidencias_UsuarioId_Usuario",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Fichajes_UsuarioId_Usuario",
                table: "Fichajes");

            migrationBuilder.DropColumn(
                name: "FichajeId_Fichaje",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "UsuarioId_Usuario",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "UsuarioId_Usuario",
                table: "Fichajes");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_IdFichaje",
                table: "Incidencias",
                column: "IdFichaje");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_IdUsuario",
                table: "Incidencias",
                column: "IdUsuario");

            migrationBuilder.CreateIndex(
                name: "IX_Fichajes_IdUsuario",
                table: "Fichajes",
                column: "IdUsuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Fichajes_Usuarios_IdUsuario",
                table: "Fichajes",
                column: "IdUsuario",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Incidencias_Fichajes_IdFichaje",
                table: "Incidencias",
                column: "IdFichaje",
                principalTable: "Fichajes",
                principalColumn: "Id_Fichaje",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Incidencias_Usuarios_IdUsuario",
                table: "Incidencias",
                column: "IdUsuario",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fichajes_Usuarios_IdUsuario",
                table: "Fichajes");

            migrationBuilder.DropForeignKey(
                name: "FK_Incidencias_Fichajes_IdFichaje",
                table: "Incidencias");

            migrationBuilder.DropForeignKey(
                name: "FK_Incidencias_Usuarios_IdUsuario",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Incidencias_IdFichaje",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Incidencias_IdUsuario",
                table: "Incidencias");

            migrationBuilder.DropIndex(
                name: "IX_Fichajes_IdUsuario",
                table: "Fichajes");

            migrationBuilder.AddColumn<int>(
                name: "FichajeId_Fichaje",
                table: "Incidencias",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioId_Usuario",
                table: "Incidencias",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UsuarioId_Usuario",
                table: "Fichajes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_FichajeId_Fichaje",
                table: "Incidencias",
                column: "FichajeId_Fichaje");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_UsuarioId_Usuario",
                table: "Incidencias",
                column: "UsuarioId_Usuario");

            migrationBuilder.CreateIndex(
                name: "IX_Fichajes_UsuarioId_Usuario",
                table: "Fichajes",
                column: "UsuarioId_Usuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Fichajes_Usuarios_UsuarioId_Usuario",
                table: "Fichajes",
                column: "UsuarioId_Usuario",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Incidencias_Fichajes_FichajeId_Fichaje",
                table: "Incidencias",
                column: "FichajeId_Fichaje",
                principalTable: "Fichajes",
                principalColumn: "Id_Fichaje");

            migrationBuilder.AddForeignKey(
                name: "FK_Incidencias_Usuarios_UsuarioId_Usuario",
                table: "Incidencias",
                column: "UsuarioId_Usuario",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario");
        }
    }
}
