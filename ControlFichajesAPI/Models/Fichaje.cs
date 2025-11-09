using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControlFichajesAPI.Models
{
    [Table("fichajes")]
    public class Fichaje
    {
        [Key]
        [Column("id_fichaje")]
        public int Id_Fichaje { get; set; }

        [Column("id_usuario")]
        public int IdUsuario { get; set; }

        [Column("fecha", TypeName = "date")]  // 🔥 CAMBIO AQUÍ
        public DateTime Fecha { get; set; }

        [Column("hora_entrada")]
        public TimeSpan? Hora_Entrada { get; set; }

        [Column("hora_salida")]
        public TimeSpan? Hora_Salida { get; set; }

        [Column("tiempo_pausa")]
        public int? Tiempo_Pausa { get; set; }
    }
}