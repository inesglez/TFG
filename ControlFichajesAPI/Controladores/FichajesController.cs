// Controladores/FichajesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using ControlFichajesAPI.Data;
using ControlFichajesAPI.Models;

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FichajesController : ControllerBase
    {
        private readonly AppDbContext _ctx;

        public FichajesController(AppDbContext ctx) => _ctx = ctx;

        // GET /api/fichajes
        [HttpGet]
        public async Task<IActionResult> GetFichajes()
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol == "admin")
            {
                var all = await _ctx.Fichajes.AsNoTracking()
                    .OrderByDescending(f => f.Fecha)
                    .ThenByDescending(f => f.Id_Fichaje)
                    .ToListAsync();
                return Ok(all);
            }

            if (idUsuario == null) return Forbid();

            var mine = await _ctx.Fichajes
                .AsNoTracking()
                .Where(f => f.IdUsuario == idUsuario.Value)
                .OrderByDescending(f => f.Fecha)
                .ThenByDescending(f => f.Id_Fichaje)
                .ToListAsync();

            return Ok(mine);
        }

        // GET /api/fichajes/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var fichaje = await _ctx.Fichajes.FindAsync(id);
            if (fichaje == null) return NotFound();

            if (rol != "admin" && fichaje.IdUsuario != idUsuario)
                return Forbid();

            return Ok(fichaje);
        }

        // NUEVO: GET /api/fichajes/historial?idUsuario=&desde=&hasta=
        [HttpGet("historial")]
        public async Task<IActionResult> GetHistorial(
            [FromQuery] int? idUsuario,
            [FromQuery] string? desde = null,
            [FromQuery] string? hasta = null)
        {
            var (userId, rol) = GetAuthInfo(User);

            // Si es empleado, solo puede ver su propio historial
            if (rol != "admin")
            {
                if (userId == null) return Forbid();
                idUsuario = userId.Value;
            }

            var q = _ctx.Fichajes.AsNoTracking().AsQueryable();

            if (idUsuario.HasValue)
                q = q.Where(f => f.IdUsuario == idUsuario.Value);

            if (!string.IsNullOrWhiteSpace(desde) && DateTime.TryParse(desde, out var dDesde))
                q = q.Where(f => f.Fecha >= DateTime.SpecifyKind(dDesde, DateTimeKind.Utc));

            if (!string.IsNullOrWhiteSpace(hasta) && DateTime.TryParse(hasta, out var dHasta))
                q = q.Where(f => f.Fecha <= DateTime.SpecifyKind(dHasta, DateTimeKind.Utc));

            var lista = await q
                .OrderByDescending(f => f.Fecha)
                .ThenByDescending(f => f.Id_Fichaje)
                .ToListAsync();

            return Ok(lista);
        }

        // POST /api/fichajes
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Fichaje dto)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol != "admin")
            {
                if (idUsuario == null) return Forbid();
                dto.IdUsuario = idUsuario.Value; // fuerza dueño
            }

            dto.Fecha = DateTime.SpecifyKind(dto.Fecha, DateTimeKind.Utc);

            _ctx.Fichajes.Add(dto);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = dto.Id_Fichaje }, dto);
        }

        // PUT /api/fichajes/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Fichaje input)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (id != input.Id_Fichaje) return BadRequest("ID inconsistente");

            var db = await _ctx.Fichajes.FindAsync(id);
            if (db == null) return NotFound();

            if (rol != "admin" && db.IdUsuario != idUsuario)
                return Forbid();

            db.Fecha = DateTime.SpecifyKind(input.Fecha, DateTimeKind.Utc);
            db.Hora_Entrada = input.Hora_Entrada;
            db.Hora_Salida = input.Hora_Salida;
            db.Tiempo_Pausa = input.Tiempo_Pausa;
            db.Tipo_Jornada = input.Tipo_Jornada;

            if (rol == "admin")
                db.IdUsuario = input.IdUsuario;

            await _ctx.SaveChangesAsync();
            return Ok(db);
        }

        // DELETE /api/fichajes/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var fichaje = await _ctx.Fichajes.FindAsync(id);
            if (fichaje == null) return NotFound();

            if (rol != "admin" && fichaje.IdUsuario != idUsuario)
                return Forbid();

            _ctx.Fichajes.Remove(fichaje);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        private (int? idUsuario, string rol) GetAuthInfo(ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? user.FindFirstValue(ClaimTypes.NameIdentifier);
            int? id = int.TryParse(sub, out var parsed) ? parsed : null;
            var rol = (user.FindFirstValue(ClaimTypes.Role) ?? "empleado").ToLowerInvariant();
            return (id, rol);
        }
        
    }
}