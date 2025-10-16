using Microsoft.EntityFrameworkCore;
using ControlFichajesAPI.Models;

namespace ControlFichajesAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Fichaje> Fichajes { get; set; }
        public DbSet<Incidencia> Incidencias { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.ToTable("Usuarios");
                entity.HasKey(e => e.Id_Usuario);
                entity.Property(e => e.Id_Usuario).HasColumnName("Id_Usuario");
                entity.Property(e => e.Nombre).HasColumnName("Nombre");
                entity.Property(e => e.Apellido).HasColumnName("Apellido");
                entity.Property(e => e.Correo).HasColumnName("Correo");
                entity.Property(e => e.Contraseña).HasColumnName("Contraseña");
                entity.Property(e => e.Rol).HasColumnName("Rol");
                entity.Property(e => e.Estado).HasColumnName("Estado");
            });

            // Fichaje
            modelBuilder.Entity<Fichaje>(entity =>
            {
                entity.ToTable("Fichajes");
                entity.HasKey(e => e.Id_Fichaje);
                entity.Property(e => e.Id_Fichaje).HasColumnName("Id_Fichaje");
                entity.Property(e => e.IdUsuario).HasColumnName("IdUsuario"); // sin guion bajo
                entity.Property(e => e.Fecha).HasColumnName("Fecha");
                entity.Property(e => e.Hora_Entrada).HasColumnName("Hora_Entrada");
                entity.Property(e => e.Hora_Salida).HasColumnName("Hora_Salida");
                entity.Property(e => e.Tiempo_Pausa).HasColumnName("Tiempo_Pausa");
                entity.Property(e => e.Tipo_Jornada).HasColumnName("Tipo_Jornada");

                // Relación con Usuario
                entity.HasOne(f => f.Usuario)
                      .WithMany()
                      .HasForeignKey(f => f.IdUsuario)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Incidencia
            modelBuilder.Entity<Incidencia>(entity =>
            {
                entity.ToTable("Incidencias");
                entity.HasKey(e => e.Id_Incidencia);
                entity.Property(e => e.Id_Incidencia).HasColumnName("Id_Incidencia");
                entity.Property(e => e.IdUsuario).HasColumnName("IdUsuario"); // sin guion bajo
                entity.Property(e => e.Fecha).HasColumnName("Fecha");
                entity.Property(e => e.Tipo).HasColumnName("Tipo");
                entity.Property(e => e.Descripcion).HasColumnName("Descripcion");
                entity.Property(e => e.Estado).HasColumnName("Estado");

                // Relación con Usuario
                entity.HasOne(i => i.Usuario)
                      .WithMany()
                      .HasForeignKey(i => i.IdUsuario)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}