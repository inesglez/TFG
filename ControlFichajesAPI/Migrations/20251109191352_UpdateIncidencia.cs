using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlFichajesAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateIncidencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Solo agregar las columnas nuevas a Incidencias
            migrationBuilder.AddColumn<string>(
                name: "Tipo",
                table: "Incidencias",
                type: "text",
                nullable: false,
                defaultValue: "Incidencia");

            migrationBuilder.AddColumn<string>(
                name: "Descripcion",
                table: "Incidencias",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RespuestaAdmin",
                table: "Incidencias",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "FechaRespuesta",
                table: "Incidencias",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaInicio",
                table: "Incidencias",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FechaFin",
                table: "Incidencias",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tipo",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "RespuestaAdmin",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "FechaRespuesta",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "FechaInicio",
                table: "Incidencias");

            migrationBuilder.DropColumn(
                name: "FechaFin",
                table: "Incidencias");
        }
    }
}