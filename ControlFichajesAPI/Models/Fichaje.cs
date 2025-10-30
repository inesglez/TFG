// Models/Fichaje.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControlFichajesAPI.Models
{
    [Table("Fichajes")]
    public class Fichaje
    {
        [Key]
        [Column("Id_Fichaje")]
        public int Id_Fichaje { get; set; }

        [Column("Id_Usuario")]
        public int IdUsuario { get; set; }

        // Fecha del día al que corresponde el fichaje (UTC)
        [Column("Fecha")]
        public DateTime Fecha { get; set; }

        // Tiempos; si en tu BD son TIME, en C# típicamente se usa TimeSpan?
        [Column("Hora_Entrada")]
        public TimeSpan? Hora_Entrada { get; set; }

        [Column("Hora_Salida")]
        public TimeSpan? Hora_Salida { get; set; }

        [Column("Tiempo_Pausa")]
        public TimeSpan? Tiempo_Pausa { get; set; }

        [Column("Tipo_Jornada")]
        public string? Tipo_Jornada { get; set; }
    }
}