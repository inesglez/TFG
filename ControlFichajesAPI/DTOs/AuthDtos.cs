namespace ControlFichajesAPI.Dtos
{
    public class LoginDto
    {
        public string Usuario { get; set; } = "";
        public string Password { get; set; } = "";
    }

    public class LoginResponseDto
    {
        public int IdUsuario { get; set; }
        public string Nombre { get; set; } = "";
        public string Rol { get; set; } = "empleado";
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = "";
    }
}