using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ControlFichajesAPI.Models
{
    public class Fichaje
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id_Fichaje { get; set; }

        // Sin atributo Column: usaremos "IdUsuario" tal cual en BD
        public int IdUsuario { get; set; }

        public Usuario? Usuario { get; set; }

        // Fecha solo día, en UTC
        public DateTime Fecha { get; set; } = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);

        public TimeSpan? Hora_Entrada { get; set; }
        public TimeSpan? Hora_Salida { get; set; }

        public int Tiempo_Pausa { get; set; } = 0;
        public string Tipo_Jornada { get; set; } = "Continua";
    }
}