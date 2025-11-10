using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControlFichajesAPI.Data;
using ControlFichajesAPI.Models;

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/admin/usuarios")]
    public class AdminUsuariosController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public AdminUsuariosController(AppDbContext ctx) => _ctx = ctx;

        // GET /api/admin/usuarios?buscar=juan&rol=admin&ordenar=nombre&activo=true
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? buscar = null,
            [FromQuery] string? rol = null,
            [FromQuery] string? ordenar = "nombre",
            [FromQuery] bool? activo = null
        )
        {
            var query = _ctx.Usuarios.AsQueryable();

            // Filtro por búsqueda (nombre, apellido o correo)
            if (!string.IsNullOrWhiteSpace(buscar))
            {
                var b = buscar.ToLower();
                query = query.Where(u => 
                    u.Nombre.ToLower().Contains(b) ||
                    u.Apellido.ToLower().Contains(b) ||
                    u.Correo.ToLower().Contains(b)
                );
            }

            // Filtro por rol
            if (!string.IsNullOrWhiteSpace(rol))
            {
                var rolLower = rol.ToLower();
                query = query.Where(u => u.Rol.ToLower() == rolLower);
            }

            // Filtro por estado activo/inactivo
            if (activo.HasValue)
            {
                var estado = activo.Value ? "Activo" : "Inactivo";
                query = query.Where(u => u.Estado == estado);
            }

            // Ordenamiento
            query = ordenar?.ToLower() switch
            {
                "apellido" => query.OrderBy(u => u.Apellido).ThenBy(u => u.Nombre),
                "correo" => query.OrderBy(u => u.Correo),
                "rol" => query.OrderBy(u => u.Rol).ThenBy(u => u.Nombre),
                _ => query.OrderBy(u => u.Nombre).ThenBy(u => u.Apellido) // por defecto: nombre
            };

            var usuarios = await query
                .Select(u => new
                {
                    idUsuario = u.Id_Usuario,
                    usuario = u.Correo,
                    nombre = u.Nombre,
                    apellido = u.Apellido,
                    correo = u.Correo,
                    rol = (u.Rol ?? "").ToLower() == "admin" ? "admin" : "empleado",
                    activo = u.Estado == "Activo"
                })
                .ToListAsync();

            return Ok(usuarios);
        }

        // POST /api/admin/usuarios
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUsuarioDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Correo))
                return BadRequest(new { message = "Correo es obligatorio" });
            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Password es obligatorio" });

            var existe = await _ctx.Usuarios.AnyAsync(u => u.Correo == dto.Correo);
            if (existe) return BadRequest(new { message = "Ya existe un usuario con ese correo" });

            var user = new Usuario
            {
                Nombre = dto.Nombre ?? "",
                Apellido = dto.Apellido ?? "",
                Correo = dto.Correo,
                Contraseña = dto.Password, // TODO: reemplazar por hash seguro
                Rol = dto.Rol,
                Estado = dto.Activo.HasValue && !dto.Activo.Value ? "Inactivo" : "Activo"
            };

            _ctx.Usuarios.Add(user);
            await _ctx.SaveChangesAsync();

            return Ok(new
            {
                idUsuario = user.Id_Usuario,
                usuario = user.Correo,
                nombre = user.Nombre,
                apellido = user.Apellido,
                correo = user.Correo,
                rol = (user.Rol ?? "").ToLower() == "admin" ? "admin" : "empleado",
                activo = user.Estado == "Activo"
            });
        }

        // PUT /api/admin/usuarios/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateUsuarioDto dto)
        {
            var user = await _ctx.Usuarios.FindAsync(id);
            if (user == null) return NotFound();

            if (!string.IsNullOrWhiteSpace(dto.Correo))
            {
                var correoOcupado = await _ctx.Usuarios
                    .AnyAsync(u => u.Correo == dto.Correo && u.Id_Usuario != id);
                if (correoOcupado)
                    return BadRequest(new { message = "Ya existe un usuario con ese correo" });
                user.Correo = dto.Correo;
            }

            if (dto.Nombre != null) user.Nombre = dto.Nombre;
            if (dto.Apellido != null) user.Apellido = dto.Apellido;
            if (!string.IsNullOrWhiteSpace(dto.Rol)) user.Rol = dto.Rol;
            if (dto.Activo.HasValue) user.Estado = dto.Activo.Value ? "Activo" : "Inactivo";
            if (!string.IsNullOrEmpty(dto.Password)) user.Contraseña = dto.Password; // TODO: hash

            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // PATCH /api/admin/usuarios/{id}/activo
        [HttpPatch("{id}/activo")]
        public async Task<IActionResult> SetActivo(int id, [FromBody] ActivoDto dto)
        {
            var user = await _ctx.Usuarios.FindAsync(id);
            if (user == null) return NotFound();

            user.Estado = dto.Activo ? "Activo" : "Inactivo";
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // PATCH /api/admin/usuarios/{id}/rol
        [HttpPatch("{id}/rol")]
        public async Task<IActionResult> SetRol(int id, [FromBody] RolDto dto)
        {
            var user = await _ctx.Usuarios.FindAsync(id);
            if (user == null) return NotFound();

            user.Rol = dto.Rol;
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // DELETE /api/admin/usuarios/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _ctx.Usuarios.FindAsync(id);
            if (user == null) return NotFound();
            _ctx.Usuarios.Remove(user);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        public class CreateUsuarioDto
        {
            public string? Usuario { get; set; }
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
            public string? Correo { get; set; }
            public string Password { get; set; } = "";
            public string Rol { get; set; } = "empleado";
            public bool? Activo { get; set; }
        }

        public class UpdateUsuarioDto
        {
            public string? Nombre { get; set; }
            public string? Apellido { get; set; }
            public string? Correo { get; set; }
            public string? Rol { get; set; }
            public bool? Activo { get; set; }
            public string? Password { get; set; }
        }

        public class ActivoDto
        {
            public bool Activo { get; set; }
        }

        public class RolDto
        {
            public string Rol { get; set; } = "";
        }
    }
}