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

        // GET /api/incidencias
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
                .Where(i => i.IdUsuario == idUsuario.Value)
                .OrderByDescending(i => i.Fecha)
                .ThenByDescending(i => i.Id_Incidencia)
                .ToListAsync();

            return Ok(mine);
        }

        // GET /api/incidencias/pendientes
        [HttpGet("pendientes")]
        public async Task<IActionResult> GetPendientes()
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            IQueryable<Incidencia> query = _ctx.Incidencias.AsNoTracking();

            if (rol != "admin")
            {
                if (idUsuario == null) return Forbid();
                query = query.Where(i => i.IdUsuario == idUsuario.Value);
            }

            var pendientes = await query
                .Where(i => i.Estado == "Pendiente")
                .OrderByDescending(i => i.Fecha)
                .ToListAsync();

            return Ok(pendientes);
        }

        // GET /api/incidencias/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null) return NotFound();

            if (rol != "admin" && incidencia.IdUsuario != idUsuario)
                return Forbid();

            return Ok(incidencia);
        }

        // POST /api/incidencias
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Incidencia dto)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol != "admin")
            {
                if (idUsuario == null) return Forbid();
                dto.IdUsuario = idUsuario.Value;
            }
            else
            {
                if (dto.IdUsuario <= 0)
                {
                    if (idUsuario == null) return BadRequest("IdUsuario requerido");
                    dto.IdUsuario = idUsuario.Value;
                }
            }

            dto.Fecha = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
            dto.Estado = "Pendiente";

            _ctx.Incidencias.Add(dto);
            await _ctx.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = dto.Id_Incidencia }, dto);
        }

        // POST /api/incidencias/{id}/justificante
        [HttpPost("{id:int}/justificante")]
        [RequestSizeLimit(10 * 1024 * 1024)] // máx 10 MB
        public async Task<IActionResult> SubirJustificante(int id, IFormFile archivo)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (archivo == null || archivo.Length == 0)
                return BadRequest("Archivo vacío o no proporcionado");

            if (archivo.ContentType != "application/pdf")
                return BadRequest("Solo se permiten archivos PDF");

            if (archivo.Length > 10 * 1024 * 1024) // 10 MB
                return BadRequest("El archivo no puede superar los 10 MB");

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null) return NotFound("Incidencia no encontrada");

            // Solo admin o dueño de la incidencia
            if (rol != "admin" && incidencia.IdUsuario != idUsuario)
                return Forbid();

            // Carpeta donde guardas los justificantes
            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Justificantes");
            if (!Directory.Exists(uploadsRoot))
                Directory.CreateDirectory(uploadsRoot);

            // Nombre único para el archivo
            var fileName = $"incidencia_{id}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
            var filePath = Path.Combine(uploadsRoot, fileName);

            // Guardar el archivo
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            // Actualizar la incidencia con el nombre del archivo
            incidencia.JustificanteMedico = fileName;
            await _ctx.SaveChangesAsync();

            return Ok(new
            {
                id_Incidencia = incidencia.Id_Incidencia,
                justificanteMedico = incidencia.JustificanteMedico,
                mensaje = "Justificante médico subido correctamente"
            });
        }

        // GET /api/incidencias/{id}/justificante
        [HttpGet("{id:int}/justificante")]
        public async Task<IActionResult> DescargarJustificante(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null || string.IsNullOrEmpty(incidencia.JustificanteMedico))
                return NotFound("Justificante no encontrado");

            // Solo admin o dueño de la incidencia
            if (rol != "admin" && incidencia.IdUsuario != idUsuario)
                return Forbid();

            var uploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Justificantes");
            var filePath = Path.Combine(uploadsRoot, incidencia.JustificanteMedico);

            if (!System.IO.File.Exists(filePath))
                return NotFound("Archivo no encontrado en el servidor");

            var bytes = await System.IO.File.ReadAllBytesAsync(filePath);
            return File(bytes, "application/pdf", incidencia.JustificanteMedico);
        }

        // PUT /api/incidencias/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Incidencia input)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (id != input.Id_Incidencia) return BadRequest("ID inconsistente");

            var db = await _ctx.Incidencias.FindAsync(id);
            if (db == null) return NotFound();

            if (rol != "admin" && db.IdUsuario != idUsuario)
                return Forbid();

            db.Tipo = input.Tipo;
            db.Descripcion = input.Descripcion;
            db.Estado = input.Estado;
            db.RespuestaAdmin = input.RespuestaAdmin;
            db.FechaInicio = input.FechaInicio;
            db.FechaFin = input.FechaFin;

            if (rol == "admin")
            {
                db.IdUsuario = input.IdUsuario;
                if (!string.IsNullOrEmpty(input.RespuestaAdmin))
                {
                    db.FechaRespuesta = DateTime.UtcNow;
                }
            }

            await _ctx.SaveChangesAsync();
            return Ok(db);
        }

        // PUT /api/incidencias/{id}/responder
        [HttpPut("{id:int}/responder")]
        public async Task<IActionResult> Responder(int id, [FromBody] RespuestaDto dto)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            if (rol != "admin") return Forbid();

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null) return NotFound();

            incidencia.RespuestaAdmin = dto.Respuesta;
            incidencia.Estado = dto.Estado;
            incidencia.FechaRespuesta = DateTime.UtcNow;

            await _ctx.SaveChangesAsync();

            return Ok(incidencia);
        }

        // DELETE /api/incidencias/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);

            var incidencia = await _ctx.Incidencias.FindAsync(id);
            if (incidencia == null) return NotFound();

            if (rol != "admin" && incidencia.IdUsuario != idUsuario)
                return Forbid();

            _ctx.Incidencias.Remove(incidencia);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        private (int? idUsuario, string rol) GetAuthInfo(ClaimsPrincipal user)
        {
            var sub = user.FindFirstValue(JwtRegisteredClaimNames.Sub) 
                      ?? user.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? user.FindFirstValue("userId")
                      ?? user.FindFirstValue("id");
            int? id = int.TryParse(sub, out var parsed) ? parsed : null;
            var rol = (user.FindFirstValue(ClaimTypes.Role) ?? "empleado").ToLowerInvariant();
            return (id, rol);
        }
    }

    public class RespuestaDto
    {
        public string Respuesta { get; set; } = string.Empty;
        public string Estado { get; set; } = "Resuelta";
    }
}