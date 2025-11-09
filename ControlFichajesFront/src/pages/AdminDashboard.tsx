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
      elevation={6}
      sx={(theme) => ({
        p: 3,
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)"
            : "linear-gradient(180deg, rgba(17,24,39,1) 0%, rgba(31,41,55,1) 100%)",
        border: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={(theme) => ({
            width: 48,
            height: 48,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: theme.palette[color].main,
            color: theme.palette.getContrastText(theme.palette[color].main),
            boxShadow: 1,
            flex: "0 0 auto",
          })}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ pt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color={color} onClick={onClick}>
          Abrir
        </Button>
      </Box>
    </Paper>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
        Panel de administración
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Gestiona usuarios, incidencias y revisa los fichajes de hoy.
      </Typography>

      {/* Layout responsive con CSS Grid nativo */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 2,
          // Breakpoints responsivos
          "@media (max-width: 599.95px)": {
            gridTemplateColumns: "repeat(4, 1fr)",
          },
          "@media (min-width: 600px) and (max-width: 899.95px)": {
            gridTemplateColumns: "repeat(8, 1fr)",
          },
          "@media (min-width: 900px)": {
            gridTemplateColumns: "repeat(12, 1fr)",
          },
        }}
      >
        {/* Item 1 */}
        <Box
          sx={{
            gridColumn: { xs: "span 4", sm: "span 4", md: "span 3" },
          }}
        >
          <CardAction
            title="Crear usuario"
            subtitle="Dar de alta un nuevo empleado o admin"
            icon={<PersonAddAlt1Icon />}
            color="success"
            onClick={() => navigate("/admin/usuarios?crear=1")}
          />
        </Box>

        {/* Item 2 */}
        <Box
          sx={{
            gridColumn: { xs: "span 4", sm: "span 4", md: "span 3" },
          }}
        >
          <CardAction
            title="Usuarios"
            subtitle="Listado, activar/inactivar, cambio de rol"
            icon={<GroupOutlinedIcon />}
            color="primary"
            onClick={() => navigate("/admin/usuarios")}
          />
        </Box>

        {/* Item 3 */}
        <Box
          sx={{
            gridColumn: { xs: "span 4", sm: "span 4", md: "span 3" },
          }}
        >
          <CardAction
            title="Incidencias"
            subtitle="Pendientes, en proceso, resueltas"
            icon={<AssignmentLateOutlinedIcon />}
            color="warning"
            onClick={() => navigate("/admin/incidencias")}
          />
        </Box>

        {/* Item 4 - 🔥 CORREGIDO */}
        <Box
          sx={{
            gridColumn: { xs: "span 4", sm: "span 4", md: "span 3" },
          }}
        >
          <CardAction
            title="Fichajes de hoy"
            subtitle="Entradas/Salidas y tiempos"
            icon={<AccessTimeOutlinedIcon />}
            color="info"
            onClick={() => navigate("/admin/fichajes-hoy")}
          />
        </Box>
      </Box>
    </Box>
  );
}