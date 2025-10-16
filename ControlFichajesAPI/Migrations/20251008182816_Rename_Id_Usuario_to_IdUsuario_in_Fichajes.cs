using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlFichajesAPI.Migrations
{
    /// <inheritdoc />
    public partial class Rename_Id_Usuario_to_IdUsuario_in_Fichajes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fichajes_Usuarios_Id_Usuario",
                table: "Fichajes");

            migrationBuilder.DropIndex(
                name: "IX_Fichajes_Id_Usuario",
                table: "Fichajes");

            migrationBuilder.RenameColumn(
                name: "Id_Usuario",
                table: "Fichajes",
                newName: "IdUsuario");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "Hora_Entrada",
                table: "Fichajes",
                type: "interval",
                nullable: true,
                oldClrType: typeof(TimeSpan),
                oldType: "interval");

            migrationBuilder.AddColumn<int>(
                name: "UsuarioId_Usuario",
                table: "Fichajes",
                type: "integer",
                nullable: true);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Fichajes_Usuarios_UsuarioId_Usuario",
                table: "Fichajes");

            migrationBuilder.DropIndex(
                name: "IX_Fichajes_UsuarioId_Usuario",
                table: "Fichajes");

            migrationBuilder.DropColumn(
                name: "UsuarioId_Usuario",
                table: "Fichajes");

            migrationBuilder.RenameColumn(
                name: "IdUsuario",
                table: "Fichajes",
                newName: "Id_Usuario");

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "Hora_Entrada",
                table: "Fichajes",
                type: "interval",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0, 0, 0),
                oldClrType: typeof(TimeSpan),
                oldType: "interval",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Fichajes_Id_Usuario",
                table: "Fichajes",
                column: "Id_Usuario");

            migrationBuilder.AddForeignKey(
                name: "FK_Fichajes_Usuarios_Id_Usuario",
                table: "Fichajes",
                column: "Id_Usuario",
                principalTable: "Usuarios",
                principalColumn: "Id_Usuario",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
