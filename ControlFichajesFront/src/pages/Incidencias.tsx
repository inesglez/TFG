import { useEffect, useState } from "react";
import { crearIncidencia, getPendientes, resolverIncidencia } from "../api/incidencias";
import { Paper, Typography, Stack, TextField, Button, List, ListItem, ListItemText, Chip } from "@mui/material";

type Incidencia = {
  id_Incidencia: number;
  idUsuario: number;
  idFichaje?: number;
  comentario: string;
  estado: string;
  fechaReporte: string;
};

export default function Incidencias() {
  const [pendientes, setPendientes] = useState<Incidencia[]>([]);
  const [comentario, setComentario] = useState("");
  const idUsuario = Number(localStorage.getItem("idUsuario") ?? 0);

  async function cargar() {
    const data = await getPendientes();
    setPendientes(data);
  }
  useEffect(() => { cargar(); }, []);

  async function crear() {
    if (!comentario.trim()) return;
    await crearIncidencia(idUsuario, comentario);
    setComentario("");
    await cargar();
  }

  async function resolver(id: number) {
    await resolverIncidencia(id, "Resuelta desde el front");
    await cargar();
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>Incidencias</Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField label="Comentario" value={comentario} onChange={e=>setComentario(e.target.value)} fullWidth />
        <Button variant="contained" onClick={crear} disabled={!idUsuario}>Reportar</Button>
      </Stack>
      <List>
        {pendientes.map(p => (
          <ListItem
            key={p.id_Incidencia}
            secondaryAction={<Button onClick={() => resolver(p.id_Incidencia)}>Resolver</Button>}
          >
            <ListItemText
              primary={`#${p.id_Incidencia} · U:${p.idUsuario} · ${new Date(p.fechaReporte).toLocaleString()}`}
              secondary={p.comentario}
            />
            <Chip label={p.estado} size="small" sx={{ ml: 2 }} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}