// src/pages/admin/AdminDashboard.tsx
import { Box, Paper, Typography, Button } from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AssignmentLateOutlinedIcon from "@mui/icons-material/AssignmentLateOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import { useNavigate } from "react-router-dom";

function CardAction({
  title,
  subtitle,
  icon,
  color,
  onClick,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: "primary" | "secondary" | "info" | "warning" | "success";
  onClick: () => void;
}) {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "#fff",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
        <Box
          sx={(theme) => ({
            width: 56,
            height: 56,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: theme.palette[color].main,
            color: theme.palette.getContrastText(theme.palette[color].main),
            boxShadow: `0 4px 12px ${theme.palette[color].main}40`,
            flex: "0 0 auto",
          })}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3, mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color={color}
          onClick={onClick}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
          }}
        >
          Abrir
        </Button>
      </Box>
    </Paper>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

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
        px: { xs: 2, sm: 3, md: 6 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1400 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              letterSpacing: "-0.02em",
              mb: 0.5,
              color: (theme) => theme.palette.mode === "dark" ? "#ffffff" : "inherit",
            }}
          >
            Panel de administración
          </Typography>
          <Typography 
            variant="body1" 
            sx={{
              color: (theme) => theme.palette.mode === "dark" ? "#e5e7eb" : "text.secondary",
            }}
          >
            Gestiona usuarios, incidencias y revisa los fichajes de hoy.
          </Typography>
        </Box>

        {/* Grid de cards */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          <CardAction
            title="Crear usuario"
            subtitle="Dar de alta un nuevo empleado o admin"
            icon={<PersonAddAlt1Icon sx={{ fontSize: 28 }} />}
            color="success"
            onClick={() => navigate("/admin/crear-usuario")}
          />

          <CardAction
            title="Usuarios"
            subtitle="Listado, activar/inactivar, cambio de rol"
            icon={<GroupOutlinedIcon sx={{ fontSize: 28 }} />}
            color="primary"
            onClick={() => navigate("/admin/usuarios")}
          />

          <CardAction
            title="Incidencias"
            subtitle="Pendientes, en proceso, resueltas"
            icon={<AssignmentLateOutlinedIcon sx={{ fontSize: 28 }} />}
            color="warning"
            onClick={() => navigate("/admin/incidencias")}
          />

          <CardAction
            title="Fichajes de hoy"
            subtitle="Entradas/Salidas y tiempos"
            icon={<AccessTimeOutlinedIcon sx={{ fontSize: 28 }} />}
            color="info"
            onClick={() => navigate("/admin/fichajes-hoy")}
          />
        </Box>
      </Box>
    </Box>
  );
}