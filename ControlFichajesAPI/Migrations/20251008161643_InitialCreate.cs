using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ControlFichajesAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id_Usuario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Apellido = table.Column<string>(type: "text", nullable: false),
                    Correo = table.Column<string>(type: "text", nullable: false),
                    Contraseña = table.Column<string>(type: "text", nullable: false),
                    Rol = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id_Usuario);
                });

            migrationBuilder.CreateTable(
                name: "Fichajes",
                columns: table => new
                {
                    Id_Fichaje = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Id_Usuario = table.Column<int>(type: "integer", nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Hora_Entrada = table.Column<TimeSpan>(type: "interval", nullable: false),
                    Hora_Salida = table.Column<TimeSpan>(type: "interval", nullable: true),
                    Tiempo_Pausa = table.Column<int>(type: "integer", nullable: false),
                    Tipo_Jornada = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fichajes", x => x.Id_Fichaje);
                    table.ForeignKey(
                        name: "FK_Fichajes_Usuarios_Id_Usuario",
                        column: x => x.Id_Usuario,
                        principalTable: "Usuarios",
                        principalColumn: "Id_Usuario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Incidencias",
                columns: table => new
                {
                    Id_Incidencia = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdFichaje = table.Column<int>(type: "integer", nullable: true),
                    IdUsuario = table.Column<int>(type: "integer", nullable: false),
                    Comentario = table.Column<string>(type: "text", nullable: false),
                    Estado = table.Column<string>(type: "text", nullable: false),
                    FechaReporte = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsuarioId_Usuario = table.Column<int>(type: "integer", nullable: true),
                    FichajeId_Fichaje = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Incidencias", x => x.Id_Incidencia);
                    table.ForeignKey(
                        name: "FK_Incidencias_Fichajes_FichajeId_Fichaje",
                        column: x => x.FichajeId_Fichaje,
                        principalTable: "Fichajes",
                        principalColumn: "Id_Fichaje");
                    table.ForeignKey(
                        name: "FK_Incidencias_Usuarios_UsuarioId_Usuario",
                        column: x => x.UsuarioId_Usuario,
                        principalTable: "Usuarios",
                        principalColumn: "Id_Usuario");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Fichajes_Id_Usuario",
                table: "Fichajes",
                column: "Id_Usuario");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_FichajeId_Fichaje",
                table: "Incidencias",
                column: "FichajeId_Fichaje");

            migrationBuilder.CreateIndex(
                name: "IX_Incidencias_UsuarioId_Usuario",
                table: "Incidencias",
                column: "UsuarioId_Usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Incidencias");

            migrationBuilder.DropTable(
                name: "Fichajes");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
