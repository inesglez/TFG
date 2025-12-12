import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Container,
  Avatar, Menu, MenuItem, Divider, Drawer, List, ListItem, ListItemButton, ListItemText
} from "@mui/material";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";

import { useColorModeContext } from "./theme/ColorModeContext";

// Autenticación
import { getAuth, isAdmin, clearAuth, isLoggedIn } from "./api/auth";
import { PrivateRoute, AdminRoute } from "./components/RouteGuards";

import Dashboard from "./pages/Dashboard";
import Fichar from "./pages/Fichar";
import Incidencias from "./pages/Incidencias";
import Login from "./pages/Login";
import Perfil from "./pages/Perfil";
import AdminIncidencias from "./pages/admin/AdminIncidencias";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminCrearUsuario from "./pages/admin/AdminCrearUsuario";
import AdminDashboard from "./pages/AdminDashboard";
import FichajesHoy from "./pages/admin/FichajesHoy";

function TopBar() {
  const { mode, toggleMode } = useColorModeContext();
  const auth = getAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          backdropFilter: "blur(8px)",
          backgroundColor: mode === "light"
            ? "rgba(255,255,255,0.9)"
            : "rgba(31,41,55,0.95)",
          borderBottom: mode === "dark" ? "1px solid rgba(75,85,99,0.3)" : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ gap: 2, px: { xs: 0, sm: 2 } }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}>
             <Box
  sx={{
    width: 40,
    height: 40,
    borderRadius: 0,
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
  }}
>
  <img 
    src="/controlFichaje.png" 
    alt="Logo" 
    style={{ width: "100%", height: "100%", objectFit: "cover" }}
  />
</Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  background: mode === "light"
                    ? "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)"
                    : "linear-gradient(135deg,#60a5fa 0%,#a78bfa 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Control Fichajes
              </Typography>
            </Box>

            {/* Botón hamburguesa (solo móvil) */}
            {isLoggedIn() && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  display: { xs: "flex", md: "none" },
                  color: "text.primary",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                aria-label="Abrir menú"
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Navegación */}
            {isLoggedIn() && (
              <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                <Button component={Link} to={isAdmin() ? "/admin" : "/usuario"} sx={navBtn}>
                  Inicio
                </Button>
                {!isAdmin() && (
                  <>
                    <Button component={Link} to="/fichar" sx={navBtn}>
                      Fichar
                    </Button>
                    <Button component={Link} to="/incidencias" sx={navBtn}>
                      Incidencias
                    </Button>
                  </>
                )}
                {isAdmin() && (
                  <>
                    <Button component={Link} to="/admin/incidencias" sx={navBtn}>
                      Incidencias
                    </Button>
                    <Button component={Link} to="/admin/usuarios" sx={navBtn}>
                      Usuarios
                    </Button>
                    <Button component={Link} to="/admin/fichajes-hoy" sx={navBtn}>
                      Fichajes hoy
                    </Button>
                  </>
                )}
              </Box>
            )}

            {/* Acciones a la derecha */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                onClick={toggleMode}
                aria-label="Cambiar tema"
                sx={{
                  color: mode === "dark" ? "#ffffff" : "text.primary",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
              </IconButton>

              {auth ? (
                <>
                  <IconButton
                    onClick={handleMenuOpen}
                    sx={{
                      ml: 0.5,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {auth.nombre?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        borderRadius: 2,
                        minWidth: 200,
                        border: "1px solid",
                        borderColor: "divider",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {auth.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isAdmin() ? "Administrador" : "Usuario"}
                      </Typography>
                    </Box>
                    <Divider />
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/perfil");
                      }}
                      sx={{ gap: 1.5, py: 1 }}
                    >
                      <PersonOutlineIcon fontSize="small" /> Mi perfil
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        handleLogout();
                      }}
                      sx={{ gap: 1.5, py: 1, color: "error.main" }}
                    >
                      <LogoutIcon fontSize="small" /> Cerrar sesión
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    boxShadow: "none",
                    "&:hover": { boxShadow: "0 4px 12px rgba(37,99,235,0.3)" },
                  }}
                >
                  Entrar
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer para móvil */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: "background.paper",
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Menú
          </Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(isAdmin() ? "/admin" : "/usuario");
                setDrawerOpen(false);
              }}
            >
              <ListItemText primary="Inicio" />
            </ListItemButton>
          </ListItem>
          {!isAdmin() && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate("/fichar");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Fichar" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate("/incidencias");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Incidencias" />
                </ListItemButton>
              </ListItem>
            </>
          )}
          {isAdmin() && (
            <>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate("/admin/incidencias");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Incidencias" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate("/admin/usuarios");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Usuarios" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    navigate("/admin/fichajes-hoy");
                    setDrawerOpen(false);
                  }}
                >
                  <ListItemText primary="Fichajes hoy" />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>
    </>
  );
}

// Estilos comunes para botones de navegación
const navBtn = {
  color: "#ffffff",
  textTransform: "none",
  fontWeight: 600,
  px: 2,
  "&:hover": {
    bgcolor: "action.hover",
  },
};

function HomeRouter() {
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%" }}>
        <TopBar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            pt: 10,
            bgcolor: "background.default",
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<HomeRouter />} />
            <Route path="/usuario" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/fichar" element={<PrivateRoute><Fichar /></PrivateRoute>} />
            <Route path="/incidencias" element={<PrivateRoute><Incidencias /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/incidencias" element={<AdminRoute><AdminIncidencias /></AdminRoute>} />
            <Route path="/admin/usuarios" element={<AdminRoute><AdminUsuarios /></AdminRoute>} />
            <Route path="/admin/crear-usuario" element={<AdminRoute><AdminCrearUsuario /></AdminRoute>} />
            <Route path="/admin/fichajes-hoy" element={<AdminRoute><FichajesHoy /></AdminRoute>} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}