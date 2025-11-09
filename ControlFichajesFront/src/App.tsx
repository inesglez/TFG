// src/App.tsx
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import Dashboard from "./pages/Dashboard";
import Fichar from "./pages/Fichar";
import Incidencias from "./pages/Incidencias";
import Login from "./pages/Login";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { useColorModeContext } from "./theme/ColorModeContext";
import { getAuth, isAdmin, clearAuth, isLoggedIn } from "./auth";
import { PrivateRoute, AdminRoute } from "./components/RouteGuards";
import AdminIncidencias from "./pages/admin/AdminIncidencias";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminDashboard from "./pages/AdminDashboard";
import FichajesHoy from "./pages/admin/FichajesHoy";

function TopBar() {
  const { mode, toggleMode } = useColorModeContext();
  const auth = getAuth();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <AppBar position="fixed" elevation={1} sx={(theme) => ({
      bgcolor: theme.palette.mode === "light" ? "#ffffff" : "#111827",
      color: theme.palette.mode === "light" ? "#0f172a" : "#e5e7eb",
      borderBottom: theme.palette.mode === "light"
        ? "1px solid rgba(15, 23, 42, 0.08)"
        : "1px solid rgba(229, 231, 235, 0.12)",
      borderRadius: 0,
      boxShadow: theme.shadows[1],
    })}>
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "inherit" }}>
          Control Fichajes
        </Typography>

        {isLoggedIn() && (
          <>
            <Button sx={{ color: "inherit" }} component={Link} to="/">Inicio</Button>
            {!isAdmin() && (
              <>
                <Button sx={{ color: "inherit" }} component={Link} to="/fichar">Fichar</Button>
                <Button sx={{ color: "inherit" }} component={Link} to="/incidencias">Incidencias</Button>
              </>
            )}
            {isAdmin() && (
              <>
                <Button sx={{ color: "inherit" }} component={Link} to="/admin">Panel admin</Button>
                <Button sx={{ color: "inherit" }} component={Link} to="/admin/incidencias">Incidencias</Button>
                <Button sx={{ color: "inherit" }} component={Link} to="/admin/usuarios">Usuarios</Button>
                <Button sx={{ color: "inherit" }} component={Link} to="/admin/fichajes-hoy">Fichajes hoy</Button>
              </>
            )}
          </>
        )}

        <IconButton color="inherit" onClick={toggleMode} aria-label="Cambiar tema" sx={{ ml: 1 }}>
          {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        {auth ? (
          <Button sx={{ color: "inherit" }} onClick={handleLogout}>Salir</Button>
        ) : (
          <Button sx={{ color: "inherit" }} component={Link} to="/login">Entrar</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

function HomeRouter() {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return isAdmin() ? <Navigate to="/admin" replace /> : <Navigate to="/usuario" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <TopBar />
      <Box
        component="main"
        sx={{
          minHeight: "100vh",
          height: "100%",
          width: "100%",
          maxWidth: "100%",
          m: 0,
          p: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: "100%",
            boxSizing: "border-box",
            mx: "0%",
            mt: { xs: "7%", sm: "6%", md: "5%" },
            px: { xs: "3%", sm: "3%", md: "3%" },
            py: { xs: "2%", sm: "2%", md: "2%" },
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<HomeRouter />} />
            <Route path="/usuario" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/fichar" element={<PrivateRoute><Fichar /></PrivateRoute>} />
            <Route path="/incidencias" element={<PrivateRoute><Incidencias /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/incidencias" element={<AdminRoute><AdminIncidencias /></AdminRoute>} />
            <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
            <Route path="/admin/fichajes-hoy" element={<AdminRoute><FichajesHoy /></AdminRoute>} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}