using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControlFichajesAPI.Data;
using ControlFichajesAPI.Models;

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/admin/crear-usuario")]
    public class AdminCrearUsuariosController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        public AdminCrearUsuariosController(AppDbContext ctx) => _ctx = ctx;

        // POST /api/admin/crear-usuario
        [HttpPost]
        public async Task<IActionResult> CrearUsuario([FromBody] CrearUsuarioDto dto)
        {
            // Validaciones
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                return BadRequest(new { message = "El nombre es obligatorio" });

            if (string.IsNullOrWhiteSpace(dto.Apellido))
                return BadRequest(new { message = "El apellido es obligatorio" });

            if (string.IsNullOrWhiteSpace(dto.Correo))
                return BadRequest(new { message = "El correo es obligatorio" });

            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "La contraseña es obligatoria" });

            // Validar formato de correo
            if (!dto.Correo.Contains("@") || !dto.Correo.Contains("."))
                return BadRequest(new { message = "El formato del correo no es válido" });

            // Verificar si el correo ya existe
            var existe = await _ctx.Usuarios.AnyAsync(u => u.Correo.ToLower() == dto.Correo.ToLower());
            if (existe)
                return BadRequest(new { message = "Ya existe un usuario con ese correo" });

            // Validar longitud de contraseña
            if (dto.Password.Length < 6)
                return BadRequest(new { message = "La contraseña debe tener al menos 6 caracteres" });

            // Crear el usuario
            var nuevoUsuario = new Usuario
            {
                Nombre = dto.Nombre.Trim(),
                Apellido = dto.Apellido.Trim(),
                Correo = dto.Correo.Trim().ToLower(),
                Contraseña = dto.Password, // TODO: implementar hash (BCrypt)
                Rol = dto.Rol?.ToLower() == "admin" ? "admin" : "empleado",
                Estado = "Activo"
            };

            _ctx.Usuarios.Add(nuevoUsuario);
            await _ctx.SaveChangesAsync();

            // Retornar el usuario creado (sin la contraseña)
            return Ok(new
            {
                message = "Usuario creado exitosamente",
                usuario = new
                {
                    idUsuario = nuevoUsuario.Id_Usuario,
                    nombre = nuevoUsuario.Nombre,
                    apellido = nuevoUsuario.Apellido,
                    correo = nuevoUsuario.Correo,
                    rol = nuevoUsuario.Rol,
                    activo = nuevoUsuario.Estado == "Activo"
                }
            });
        }

        // DTO para crear usuario
        public class CrearUsuarioDto
        {
            public string Nombre { get; set; } = "";
            public string Apellido { get; set; } = "";
            public string Correo { get; set; } = "";
            public string Password { get; set; } = "";
            public string? Rol { get; set; } = "empleado"; // "admin" o "empleado"
        }
    }
}