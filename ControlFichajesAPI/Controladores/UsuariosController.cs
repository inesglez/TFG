using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ControlFichajesAPI.Data;
using ControlFichajesAPI.Models;
using ControlFichajesAPI.Dtos;

namespace ControlFichajesAPI.Controladores
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _ctx;
        private readonly IConfiguration _config;

        public UsuariosController(AppDbContext ctx, IConfiguration config)
        {
            _ctx = ctx;
            _config = config;
        }

        // POST: api/usuarios/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Usuario) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Usuario y password son requeridos");

            var input = dto.Usuario.Trim();

            var user = await _ctx.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    EF.Functions.ILike((u.Nombre ?? ""), input) ||
                    EF.Functions.ILike((u.Correo ?? ""), input)
                );

            if (user == null)
                return Unauthorized("Usuario no encontrado");

            if (!string.Equals(user.Estado?.Trim(), "activo", StringComparison.OrdinalIgnoreCase))
                return Unauthorized("Usuario inactivo");

            if (!string.Equals(user.Contraseña, dto.Password))
                return Unauthorized("Contraseña incorrecta");

            var token = GenerateJwtToken(user);

            var resp = new LoginResponseDto
            {
                IdUsuario = user.Id_Usuario,
                Nombre = user.Nombre,
                Rol = user.Rol,
                Token = token
            };

            return Ok(resp);
        }

        // GET: api/usuarios/me (usuario autenticado)
        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var (idUsuario, _) = GetAuthInfo(User);
            if (idUsuario == null) return Forbid();

            var me = await _ctx.Usuarios.AsNoTracking()
                .Where(u => u.Id_Usuario == idUsuario.Value)
                .Select(u => new { u.Id_Usuario, u.Nombre, u.Correo, u.Rol, u.Estado })
                .FirstOrDefaultAsync();

            if (me == null) return NotFound();
            return Ok(me);
        }

        // GET: api/usuarios (solo admin)
        [Authorize(Roles = "admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var usuarios = await _ctx.Usuarios.AsNoTracking().ToListAsync();
            return Ok(usuarios);
        }

        // GET: api/usuarios/5 (admin o el mismo usuario)
        [Authorize]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var (idUsuario, rol) = GetAuthInfo(User);
            if (rol != "admin" && idUsuario != id)
                return Forbid();

            var usuario = await _ctx.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            return Ok(usuario);
        }

        // POST: api/usuarios (solo admin)
        [Authorize(Roles = "admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Usuario usuario)
        {
            if (string.IsNullOrWhiteSpace(usuario.Nombre))
                return BadRequest("Nombre requerido");

            if (string.IsNullOrEmpty(usuario.Rol))
                usuario.Rol = "empleado";

            if (string.IsNullOrEmpty(usuario.Estado))
                usuario.Estado = "activo";

            _ctx.Usuarios.Add(usuario);
            await _ctx.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = usuario.Id_Usuario }, usuario);
        }

        // PUT: api/usuarios/5 (admin o el mismo usuario)
        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Usuario input)
        {
            var (idUsuario, rol) = GetAuthInfo(User);
            if (rol != "admin" && idUsuario != id)
                return Forbid();

            if (id != input.Id_Usuario) return BadRequest("ID inconsistente");

            var db = await _ctx.Usuarios.FindAsync(id);
            if (db == null) return NotFound();

            db.Nombre = input.Nombre;
            db.Apellido = input.Apellido;
            db.Correo = input.Correo;

            // Solo admin puede cambiar rol y estado
            if (rol == "admin")
            {
                db.Rol = string.IsNullOrEmpty(input.Rol) ? db.Rol : input.Rol;
                db.Estado = string.IsNullOrEmpty(input.Estado) ? db.Estado : input.Estado;
            }

            await _ctx.SaveChangesAsync();
            return Ok(db);
        }

        // DELETE: api/usuarios/5 (solo admin)
        [Authorize(Roles = "admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var usuario = await _ctx.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();
            _ctx.Usuarios.Remove(usuario);
            await _ctx.SaveChangesAsync();
            return NoContent();
        }

        // GET: api/usuarios/debug (solo admin)
        [Authorize(Roles = "admin")]
        [HttpGet("debug")]
        public async Task<IActionResult> DebugListado()
        {
            var lista = await _ctx.Usuarios
                .AsNoTracking()
                .Select(u => new { u.Id_Usuario, u.Nombre, u.Correo, u.Rol, u.Estado })
                .ToListAsync();

            return Ok(lista);
        }

        // Helpers
        private string GenerateJwtToken(Usuario u)
        {
            var jwt = _config.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, u.Id_Usuario.ToString()),
                new Claim(ClaimTypes.Role, (u.Rol ?? "empleado").ToLowerInvariant()),
                new Claim(ClaimTypes.Name, u.Nombre ?? ""),
                new Claim(ClaimTypes.Email, u.Correo ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwt["ExpiresMinutes"] ?? "120")),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
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