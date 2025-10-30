using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControlFichajesAPI.Data;
using System.Linq;

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/admin/fichajes")]
    public class AdminFichajesController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public AdminFichajesController(AppDbContext ctx) => _ctx = ctx;

        [HttpGet("hoy")]
        public async Task<IActionResult> GetHoy()
        {
            var hoyUtc = DateTime.UtcNow.Date;

            var q =
                from f in _ctx.Fichajes
                where f.Fecha.Date == hoyUtc
                join u in _ctx.Usuarios on f.IdUsuario equals u.Id_Usuario into gj
                from u in gj.DefaultIfEmpty() // LEFT JOIN
                select new
                {
                    id_Fichaje = f.Id_Fichaje,
                    usuario = u == null ? null : new
                    {
                        idUsuario = u.Id_Usuario,
                        nombre = u.Nombre,
                        apellido = u.Apellido,
                        correo = u.Correo,
                        rol = (u.Rol != null && u.Rol.ToLower() == "admin") ? "admin" : "empleado",
                        activo = (u.Estado == "Activo")
                    },
                    fecha = f.Fecha.ToString("yyyy-MM-dd"),
                    hora_Entrada = f.Hora_Entrada,
                    hora_Salida = f.Hora_Salida,
                    tiempo_Pausa = f.Tiempo_Pausa,
                    tipo_Jornada = f.Tipo_Jornada
                };

            var fichajes = await q
                .OrderByDescending(x => x.fecha)
                .ThenByDescending(x => x.id_Fichaje)
                .ToListAsync();

            return Ok(fichajes);
        }

        [HttpGet]
        public async Task<IActionResult> GetRango([FromQuery] string desde, [FromQuery] string hasta)
        {
            if (!DateTime.TryParse(desde, out var dDesde) || !DateTime.TryParse(hasta, out var dHasta))
                return BadRequest(new { message = "Formato de fecha inválido. Usa YYYY-MM-DD." });

            dDesde = dDesde.Date;
            dHasta = dHasta.Date.AddDays(1).AddTicks(-1);

            var q =
                from f in _ctx.Fichajes
                where f.Fecha >= dDesde && f.Fecha <= dHasta
                join u in _ctx.Usuarios on f.IdUsuario equals u.Id_Usuario into gj
                from u in gj.DefaultIfEmpty()
                select new
                {
                    id_Fichaje = f.Id_Fichaje,
                    usuario = u == null ? null : new
                    {
                        idUsuario = u.Id_Usuario,
                        usuario = u.Correo, // si quieres mostrar el correo como identificador
                        nombre = u.Nombre,
                        apellido = u.Apellido,
                        correo = u.Correo,
                        rol = (u.Rol != null && u.Rol.ToLower() == "admin") ? "admin" : "empleado",
                        activo = (u.Estado == "Activo")
                    },
                    fecha = f.Fecha.ToString("yyyy-MM-dd"),
                    hora_Entrada = f.Hora_Entrada,
                    hora_Salida = f.Hora_Salida,
                    tiempo_Pausa = f.Tiempo_Pausa,
                    tipo_Jornada = f.Tipo_Jornada
                };

            var fichajes = await q
                .OrderByDescending(x => x.fecha)
                .ThenByDescending(x => x.id_Fichaje)
                .ToListAsync();

            return Ok(fichajes);
        }
    }
}