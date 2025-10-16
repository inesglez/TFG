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
                .Where(f => f.IdUsuario == idUsuario.Value)    // <- IdUsuario
                .OrderByDescending(f => f.Fecha)
                .ThenByDescending(f => f.Id_Fichaje)
                .ToListAsync();

            return Ok(mine);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var fichaje = await _ctx.Fichajes.FindAsync(id);
            if (fichaje == null) return NotFound();

            if (rol != "admin" && fichaje.IdUsuario != idUsuario) // <- IdUsuario
                return Forbid();

            return Ok(fichaje);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Fichaje dto)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol != "admin")
            {
                if (idUsuario == null) return Forbid();
                dto.IdUsuario = idUsuario.Value; // <- forzar dueño si no es admin
            }

            dto.Fecha = DateTime.SpecifyKind(dto.Fecha, DateTimeKind.Utc);

            _ctx.Fichajes.Add(dto);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = dto.Id_Fichaje }, dto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Fichaje input)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (id != input.Id_Fichaje) return BadRequest("ID inconsistente");

            var db = await _ctx.Fichajes.FindAsync(id);
            if (db == null) return NotFound();

            if (rol != "admin" && db.IdUsuario != idUsuario) // <- IdUsuario
                return Forbid();

            db.Fecha = DateTime.SpecifyKind(input.Fecha, DateTimeKind.Utc);
            db.Hora_Entrada = input.Hora_Entrada;
            db.Hora_Salida = input.Hora_Salida;
            db.Tiempo_Pausa = input.Tiempo_Pausa;
            db.Tipo_Jornada = input.Tipo_Jornada;

            if (rol == "admin")
                db.IdUsuario = input.IdUsuario; // <- admin puede reasignar

            await _ctx.SaveChangesAsync();
            return Ok(db);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var fichaje = await _ctx.Fichajes.FindAsync(id);
            if (fichaje == null) return NotFound();

            if (rol != "admin" && fichaje.IdUsuario != idUsuario) // <- IdUsuario
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