using ControlFichajesAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace ControlFichajesAPI.Data
{
    public static class Seed
    {
        public static async Task EnsureAsync(AppDbContext ctx)
        {
            await ctx.Database.MigrateAsync();

            if (!await ctx.Usuarios.AnyAsync())
            {
                ctx.Usuarios.AddRange(
                    new Usuario
                    {
                        Nombre = "admin",
                        Apellido = "Sistema",
                        Correo = "admin@demo.local",
                        Contraseña = "admin123", // temporal, luego hashearemos
                        Rol = "admin",
                        Estado = "activo"
                    },
                    new Usuario
                    {
                        Nombre = "empleado1",
                        Apellido = "Demo",
                        Correo = "empleado1@demo.local",
                        Contraseña = "empleado123", // temporal
                        Rol = "empleado",
                        Estado = "activo"
                    }
                );
                await ctx.SaveChangesAsync();
            }
        }
    }
}