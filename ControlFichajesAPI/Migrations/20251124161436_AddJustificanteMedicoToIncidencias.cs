using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControlFichajesAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddJustificanteMedicoToIncidencias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                schema: "public",
                table: "Incidencias",
                type: "text",
                nullable: false,
                defaultValue: "Incidencia",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                schema: "public",
                table: "Incidencias",
                type: "text",
                nullable: false,
                defaultValue: "Pendiente",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<string>(
                name: "JustificanteMedico",
                schema: "public",
                table: "Incidencias",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JustificanteMedico",
                schema: "public",
                table: "Incidencias");

            migrationBuilder.AlterColumn<string>(
                name: "Tipo",
                schema: "public",
                table: "Incidencias",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Incidencia");

            migrationBuilder.AlterColumn<string>(
                name: "Estado",
                schema: "public",
                table: "Incidencias",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "Pendiente");
        }
    }
}