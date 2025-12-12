using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControlFichajesAPI.Data;
using System.Linq;

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/admin/incidencias")]
    public class AdminIncidenciasController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public AdminIncidenciasController(AppDbContext ctx) => _ctx = ctx;

        // GET: api/admin/incidencias
        [HttpGet]
        public async Task<IActionResult> GetIncidencias(
            [FromQuery] string? estado,
            [FromQuery] int? idUsuario,
            [FromQuery] string? tipo,
            [FromQuery] string? fechaDesde,
            [FromQuery] string? fechaHasta)
        {
            // LEFT JOIN a Usuarios
            var q =
                from i in _ctx.Incidencias
                join u in _ctx.Usuarios on i.IdUsuario equals u.Id_Usuario into gj
                from u in gj.DefaultIfEmpty()
                select new
                {
                    id = i.Id_Incidencia,
                    idUsuario = i.IdUsuario,
                    usuario = u == null ? null : new
                    {
                        idUsuario = u.Id_Usuario,
                        nombre = u.Nombre,
                        apellido = u.Apellido,
                        correo = u.Correo,
                        rol = (u.Rol != null && u.Rol.ToLower() == "admin") ? "admin" : "empleado",
                        activo = (u.Estado == "Activo")
                    },
                    fecha = i.Fecha,
                    tipo = i.Tipo,
                    descripcion = i.Descripcion,
                    estado = i.Estado,
                    respuestaAdmin = i.RespuestaAdmin,
                    fechaInicio = i.FechaInicio,
                    fechaFin = i.FechaFin,
                    fechaRespuesta = i.FechaRespuesta,
                    justificanteMedico = i.JustificanteMedico 
                };

            // Parseo de fechas
            DateTime? desde = null;
            DateTime? hasta = null;

            if (!string.IsNullOrWhiteSpace(fechaDesde) && DateTime.TryParse(fechaDesde, out var tmpDesde))
            {
                desde = tmpDesde.Date;
            }

            if (!string.IsNullOrWhiteSpace(fechaHasta) && DateTime.TryParse(fechaHasta, out var tmpHasta))
            {
                hasta = tmpHasta.Date.AddDays(1).AddTicks(-1); // incluir todo el día
            }

            // Filtros
            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(x => x.estado != null && x.estado.ToLower() == estado.ToLower());

            if (idUsuario.HasValue)
                q = q.Where(x => x.idUsuario == idUsuario.Value);

            if (!string.IsNullOrWhiteSpace(tipo))
                q = q.Where(x => x.tipo != null && x.tipo.ToLower() == tipo.ToLower());

            if (desde.HasValue)
                q = q.Where(x => x.fecha >= desde.Value);

            if (hasta.HasValue)
                q = q.Where(x => x.fecha <= hasta.Value);

            var list = await q
                .OrderByDescending(x => x.fecha)
                .ThenByDescending(x => x.id)
                .Select(x => new
                {
                    id_Incidencia = x.id,
                    idUsuario = x.idUsuario,
                    nombreUsuario = x.usuario != null ? $"{x.usuario.nombre} {x.usuario.apellido}" : null,
                    fecha = x.fecha.ToString("yyyy-MM-dd"),
                    tipo = x.tipo,
                    descripcion = x.descripcion,
                    estado = x.estado,
                    respuestaAdmin = x.respuestaAdmin,
                    fechaInicio = x.fechaInicio,
                    fechaFin = x.fechaFin,
                    fechaRespuesta = x.fechaRespuesta != null
                        ? x.fechaRespuesta.Value.ToString("yyyy-MM-dd")
                        : null,
                    justificanteMedico = x.justificanteMedico 
                })
                .ToListAsync();

            return Ok(list);
        }

        // PATCH: api/admin/incidencias/{id}/estado
        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> UpdateEstado(int id, [FromBody] EstadoDto dto)
        {
            var inc = await _ctx.Incidencias.FindAsync(id);
            if (inc == null) return NotFound(new { message = "Incidencia no encontrada" });

            inc.Estado = dto.Estado;
            if (!string.IsNullOrWhiteSpace(dto.RespuestaAdmin))
            {
                inc.RespuestaAdmin = dto.RespuestaAdmin;
            }
            inc.FechaRespuesta = DateTime.UtcNow;
            
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        public class EstadoDto
        {
            public string Estado { get; set; } = "";
            public string? RespuestaAdmin { get; set; }
        }
    }
}