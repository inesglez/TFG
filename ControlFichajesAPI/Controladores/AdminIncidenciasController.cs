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
        public async Task<IActionResult> GetIncidencias([FromQuery] string? estado, [FromQuery] int? idUsuario)
        {
            // LEFT JOIN a Usuarios (sin navegación)
            // Variante A: si tu modelo Incidencia usa Fecha y Descripcion (como tu AppDbContext actual)
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
                    fecha = i.Fecha,                 // Modelo con propiedad Fecha
                    comentario = i.Descripcion,      // Modelo con propiedad Descripcion
                    estado = i.Estado
                };

            // Variante B: si tu tabla/modelo Incidencias realmente usa FechaReporte y Comentario (del documento),
            // comenta la proyección de la Variante A y usa esta:
            /*
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
                    fecha = EF.Property<DateTime>(i, "FechaReporte"),
                    comentario = EF.Property<string?>(i, "Comentario"),
                    estado = i.Estado
                };
            */

            if (!string.IsNullOrWhiteSpace(estado))
                q = q.Where(x => (x.estado ?? "").ToLower() == estado.ToLower());

            if (idUsuario.HasValue)
                q = q.Where(x => x.idUsuario == idUsuario.Value);

            var list = await q
                .OrderByDescending(x => x.fecha)
                .ThenByDescending(x => x.id)
                .Select(x => new
                {
                    x.id,
                    usuario = x.usuario,
                    fecha = x.fecha.ToString("yyyy-MM-dd"),
                    comentario = x.comentario,
                    estado = (x.estado ?? "").ToLower()
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
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        public class EstadoDto
        {
            public string Estado { get; set; } = "";
        }
    }
}