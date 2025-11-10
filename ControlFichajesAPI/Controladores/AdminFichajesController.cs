using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using QuestPDF.Helpers;
using ControlFichajesAPI.Data;
using ControlFichajesAPI.Models; // o Entidades, según dónde esté Fichaje.cs

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/admin/fichajes")]
    public class AdminFichajesController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public AdminFichajesController(AppDbContext ctx) => _ctx = ctx;

        // ✅ Tu código actual (GetHoy, GetRango) permanece igual...


        // ✅ --- Nuevo endpoint para generar PDF ---
        [HttpGet("pdf/{idUsuario}")]
        public async Task<IActionResult> DescargarPdfFichajes(
            int idUsuario,
            [FromQuery] DateTime? fechaInicio,
            [FromQuery] DateTime? fechaFin)
        {
            var usuario = await _ctx.Usuarios
                .FirstOrDefaultAsync(u => u.Id_Usuario == idUsuario);

            if (usuario == null)
                return NotFound(new { message = "Usuario no encontrado" });

            var query = _ctx.Fichajes
                .Where(f => f.IdUsuario == idUsuario);

            // Aplicar filtros de fechas
            if (fechaInicio.HasValue)
                query = query.Where(f => f.Fecha.Date >= fechaInicio.Value.Date);

            if (fechaFin.HasValue)
                query = query.Where(f => f.Fecha.Date <= fechaFin.Value.Date);

            var fichajes = await query
                .OrderBy(f => f.Fecha)
                .ThenBy(f => f.Hora_Entrada)
                .ToListAsync();

            QuestPDF.Settings.License = LicenseType.Community;

            var pdf = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Encabezado del PDF
                    page.Header()
                        .Column(column =>
                        {
                            column.Item().Text("Historial de fichajes")
                                .Bold().FontSize(20)
                                .FontColor(Colors.Blue.Darken2);
                            column.Item().Text($"{usuario.Nombre} {usuario.Apellido}")
                                .FontSize(14);
                            column.Item().Text($"Correo: {usuario.Correo}")
                                .FontSize(10);

                            if (fechaInicio.HasValue || fechaFin.HasValue)
                            {
                                string rangoTexto = fechaInicio.HasValue && fechaFin.HasValue
                                    ? $"Período: {fechaInicio.Value:dd/MM/yyyy} - {fechaFin.Value:dd/MM/yyyy}"
                                    : fechaInicio.HasValue
                                        ? $"Desde: {fechaInicio.Value:dd/MM/yyyy}"
                                        : $"Hasta: {fechaFin.Value:dd/MM/yyyy}";

                                column.Item().Text(rangoTexto).Italic().FontSize(10);
                            }
                            else
                            {
                                column.Item().Text("Historial completo").Italic().FontSize(10);
                            }

                            column.Item().PaddingVertical(5).LineHorizontal(1);
                        });

                    // Tabla de fichajes
                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.ConstantColumn(80);
                            columns.ConstantColumn(60);
                            columns.ConstantColumn(60);
                            columns.ConstantColumn(60);
                            columns.ConstantColumn(80);
                        });

                        // Cabeceras
                        table.Header(header =>
                        {
                            header.Cell().Text("Fecha").Bold();
                            header.Cell().Text("Entrada").Bold();
                            header.Cell().Text("Salida").Bold();
                            header.Cell().Text("Pausa").Bold();
                            header.Cell().Text("Horas").Bold();
                        });

                        foreach (var f in fichajes)
                        {
                            var horas = CalcularHoras(f);

                            table.Cell().Text(f.Fecha.ToString("dd/MM/yyyy"));
                            table.Cell().Text(f.Hora_Entrada?.ToString(@"hh\:mm") ?? "-");
                            table.Cell().Text(f.Hora_Salida?.ToString(@"hh\:mm") ?? "-");
                            table.Cell().Text($"{f.Tiempo_Pausa ?? 0} min");
                            table.Cell().Text(horas);
                        }
                    });

                    // Pie de página
                    page.Footer()
                        .AlignCenter()
                        .Text($"Generado el {DateTime.Now:dd/MM/yyyy HH:mm}");
                });
            }).GeneratePdf();

            var nombreArchivo = $"Fichajes_{usuario.Nombre}_{usuario.Apellido}_{DateTime.Now:yyyyMMdd}.pdf";
            return File(pdf, "application/pdf", nombreArchivo);
        }

        // Métodos auxiliares
        private string CalcularHoras(Fichaje f)
        {
            if (f.Hora_Entrada == null || f.Hora_Salida == null)
                return "-";

            var total = f.Hora_Salida.Value - f.Hora_Entrada.Value;
            var pausa = TimeSpan.FromMinutes(f.Tiempo_Pausa ?? 0);
            var trabajadas = total - pausa;

            return trabajadas.TotalHours < 0
                ? "-"
                : $"{(int)trabajadas.TotalHours}h {trabajadas.Minutes}m";
        }
    }
}