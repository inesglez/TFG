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

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            // Logging temporal para ver las consultas SQL exactas
            optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information);
            optionsBuilder.EnableSensitiveDataLogging();
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Por claridad, fijamos el esquema por defecto a public
            modelBuilder.HasDefaultSchema("public");

            // ========== Usuario ==========
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

            // ========== Fichaje ==========
            modelBuilder.Entity<Fichaje>(entity =>
            {
                entity.ToTable("fichajes"); // ← Tabla en minúsculas
                entity.HasKey(e => e.Id_Fichaje);

                entity.Property(e => e.Id_Fichaje).HasColumnName("id_fichaje");
                entity.Property(e => e.IdUsuario).HasColumnName("id_usuario").IsRequired();
                entity.Property(e => e.Fecha).HasColumnName("fecha").IsRequired();
                entity.Property(e => e.Hora_Entrada).HasColumnName("hora_entrada");
                entity.Property(e => e.Hora_Salida).HasColumnName("hora_salida");
                entity.Property(e => e.Tiempo_Pausa).HasColumnName("tiempo_pausa");
            });

            // ========== Incidencia ==========
            modelBuilder.Entity<Incidencia>(entity =>
            {
                entity.ToTable("Incidencias");
                entity.HasKey(e => e.Id_Incidencia);

                entity.Property(e => e.Id_Incidencia)
                    .HasColumnName("Id_Incidencia")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.IdUsuario)
                    .HasColumnName("IdUsuario")
                    .IsRequired();

                entity.Property(e => e.Fecha)
                    .HasColumnName("Fecha")
                    .IsRequired();

                entity.Property(e => e.Tipo)
                    .HasColumnName("Tipo")
                    .HasDefaultValue("Incidencia");

                entity.Property(e => e.Descripcion)
                    .HasColumnName("Descripcion")
                    .IsRequired();

                entity.Property(e => e.Estado)
                    .HasColumnName("Estado")
                    .HasDefaultValue("Pendiente");

                entity.Property(e => e.RespuestaAdmin)
                    .HasColumnName("RespuestaAdmin");

                entity.Property(e => e.FechaRespuesta)
                    .HasColumnName("FechaRespuesta");

                entity.Property(e => e.FechaInicio)
                    .HasColumnName("FechaInicio");

                entity.Property(e => e.FechaFin)
                    .HasColumnName("FechaFin");
            });
        }
    }
}