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

        // GET /api/admin/usuarios
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _ctx.Usuarios
                .Select(u => new
                {
                    idUsuario = u.Id_Usuario,
                    usuario = u.Correo,  // usamos correo como identificador visible
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
            public string? Usuario { get; set; } // ignorado de momento
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
            public string? Rol { get; set; } // "admin" | "empleado"
            public bool? Activo { get; set; }
            public string? Password { get; set; } // opcional
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