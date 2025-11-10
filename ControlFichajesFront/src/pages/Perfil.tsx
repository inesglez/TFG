// src/pages/Perfil.tsx
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Stack,
  Divider,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
} from "@mui/material";
import { useState } from "react";
import { getAuth } from "../api/auth";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import EditIcon from "@mui/icons-material/Edit";

// Avatares predefinidos (emojis)
const AVATARES = [
  "😀", "😎", "🤓", "😊", "🥳", "🤩", "😇", "🙂",
  "🐶", "🐱", "🐼", "🦊", "🐻", "🐯", "🦁", "🐸",
  "🚀", "⚡", "🔥", "⭐", "💎", "🎯", "🎨", "🎭",
];

export default function Perfil() {
  const auth = getAuth();
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [openAvatarDialog, setOpenAvatarDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Avatar seleccionado (guardado en localStorage)
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    localStorage.getItem(`avatar_${auth?.idUsuario}`) || auth?.nombre.charAt(0).toUpperCase() || "👤"
  );

const userEmail = auth?.email || "Sin correo configurado";

  if (!auth) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">No hay sesión activa</Alert>
      </Box>
    );
  }

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      // TODO: Llamar al backend para cambiar la contraseña
      // await api.post("/Usuarios/cambiar-password", { currentPassword, newPassword });
      
      setSuccess("Contraseña cambiada correctamente");
      setOpenPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e?.response?.data ?? "Error al cambiar la contraseña");
    }
  };

  const handleSelectAvatar = (avatar: string) => {
    setSelectedAvatar(avatar);
    localStorage.setItem(`avatar_${auth.idUsuario}`, avatar);
    setOpenAvatarDialog(false);
    setSuccess("Avatar actualizado correctamente");
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        bgcolor: "background.default",
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 800,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header con avatar */}
        <Box sx={{ p: 4, bgcolor: "#f8fafc" }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  bgcolor: "primary.main",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
                }}
              >
                {selectedAvatar}
              </Avatar>
              <IconButton
                onClick={() => setOpenAvatarDialog(true)}
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": { bgcolor: "background.paper" },
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {auth.nombre}
              </Typography>
              <Chip
                icon={
                  auth.rol === "admin" ? (
                    <AdminPanelSettingsIcon />
                  ) : (
                    <PersonIcon />
                  )
                }
                label={auth.rol === "admin" ? "Administrador" : "Empleado"}
                color={auth.rol === "admin" ? "error" : "primary"}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* Información del perfil */}
        <Box sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 600, letterSpacing: 1 }}
              >
                Información Personal
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <BadgeIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ID de Usuario
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  #{auth.idUsuario}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <PersonIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Nombre
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {auth.nombre}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <EmailIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Correo electrónico
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {userEmail}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <AdminPanelSettingsIcon color="action" />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Rol
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {auth.rol === "admin" ? "Administrador" : "Empleado"}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Acciones */}
          <Stack spacing={2}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 600, letterSpacing: 1 }}
            >
              Seguridad
            </Typography>

            {success && (
              <Alert severity="success" onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            <Button
              variant="outlined"
              startIcon={<LockIcon />}
              onClick={() => setOpenPasswordDialog(true)}
              sx={{
                justifyContent: "flex-start",
                textTransform: "none",
                py: 1.5,
              }}
            >
              Cambiar contraseña
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Dialog para cambiar contraseña */}
      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant="outlined"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenPasswordDialog(false)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Cambiar contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para seleccionar avatar */}
      <Dialog
        open={openAvatarDialog}
        onClose={() => setOpenAvatarDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Selecciona tu avatar</DialogTitle>
        <DialogContent>
          {/* ✅ Usando Box con CSS Grid en lugar de Grid de MUI */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(4, 1fr)",
                sm: "repeat(6, 1fr)",
              },
              gap: 1.5,
              mt: 1,
            }}
          >
            {AVATARES.map((avatar) => (
              <Box
                key={avatar}
                onClick={() => handleSelectAvatar(avatar)}
                sx={{
                  aspectRatio: "1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  borderRadius: 2,
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: selectedAvatar === avatar ? "primary.main" : "divider",
                  bgcolor: selectedAvatar === avatar ? "primary.light" : "background.paper",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "scale(1.1)",
                  },
                }}
              >
                {avatar}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenAvatarDialog(false)}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}