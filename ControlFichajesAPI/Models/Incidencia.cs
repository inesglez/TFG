using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControlFichajesAPI.Models
{
    [Table("Incidencias")]
    public class Incidencia
    {
        [Key]
        [Column("Id_Incidencia")]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id_Incidencia { get; set; }

        [Column("IdUsuario")]
        [Required]
        public int IdUsuario { get; set; }

        [Column("Fecha")]
        public DateTime Fecha { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc);
        
        [Column("Tipo")]
        public string Tipo { get; set; } = "Incidencia";
        
        [Column("Descripcion")]
        public string Descripcion { get; set; } = string.Empty;
        
        [Column("Estado")]
        public string Estado { get; set; } = "Pendiente";
        
        [Column("RespuestaAdmin")]
        public string? RespuestaAdmin { get; set; }
        
        [Column("FechaRespuesta")]
        public DateTime? FechaRespuesta { get; set; }
        
        [Column("FechaInicio")]
        public string? FechaInicio { get; set; }
        
        [Column("FechaFin")]
        public string? FechaFin { get; set; }

        [Column("JustificanteMedico")]
        public string? JustificanteMedico{ get; set; }
    }
}