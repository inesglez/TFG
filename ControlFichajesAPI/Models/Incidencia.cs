using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControlFichajesAPI.Models
{
    public class Incidencia
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id_Incidencia { get; set; }

        public int IdUsuario { get; set; } // sin guion bajo


        public DateTime Fecha { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
        public string? Tipo { get; set; }
        public string? Descripcion { get; set; }
        public string? Estado { get; set; } = "Pendiente";
    }
}