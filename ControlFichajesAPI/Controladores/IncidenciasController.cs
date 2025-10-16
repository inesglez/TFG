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
    public class IncidenciasController : ControllerBase
    {
        private readonly AppDbContext _ctx;

        public IncidenciasController(AppDbContext ctx) => _ctx = ctx;

        [HttpGet]
        public async Task<IActionResult> GetIncidencias()
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol == "admin")
            {
                var all = await _ctx.Incidencias.AsNoTracking()
                    .OrderByDescending(i => i.Fecha)
                    .ThenByDescending(i => i.Id_Incidencia)
                    .ToListAsync();
                return Ok(all);
            }

            if (idUsuario == null) return Forbid();

            var mine = await _ctx.Incidencias
                .AsNoTracking()
                .Where(i => i.IdUsuario == idUsuario.Value) // <- IdUsuario
                .OrderByDescending(i => i.Fecha)
                .ThenByDescending(i => i.Id_Incidencia)
                .ToListAsync();

            return Ok(mine);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null) return NotFound();

            if (rol != "admin" && incidencia.IdUsuario != idUsuario) // <- IdUsuario
                return Forbid();

            return Ok(incidencia);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Incidencia dto)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol != "admin")
            {
                if (idUsuario == null) return Forbid();
                dto.IdUsuario = idUsuario.Value; // <- forzar dueño
            }

            dto.Fecha = DateTime.SpecifyKind(dto.Fecha, DateTimeKind.Utc);

            _ctx.Incidencias.Add(dto);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = dto.Id_Incidencia }, dto);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Incidencia input)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (id != input.Id_Incidencia) return BadRequest("ID inconsistente");

            var db = await _ctx.Incidencias.FindAsync(id);
            if (db == null) return NotFound();

            if (rol != "admin" && db.IdUsuario != idUsuario) // <- IdUsuario
                return Forbid();

            db.Fecha = DateTime.SpecifyKind(input.Fecha, DateTimeKind.Utc);
            db.Tipo = input.Tipo;
            db.Descripcion = input.Descripcion;
            db.Estado = input.Estado;

            if (rol == "admin")
                db.IdUsuario = input.IdUsuario;

            await _ctx.SaveChangesAsync();
            return Ok(db);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null) return NotFound();

            if (rol != "admin" && incidencia.IdUsuario != idUsuario) // <- IdUsuario
                return Forbid();

            _ctx.Incidencias.Remove(incidencia);
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