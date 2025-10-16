import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
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
import Admin from "./pages/Admin";

function TopBar() {
  const { mode, toggleMode } = useColorModeContext();
  const auth = getAuth();
  const navigate = useNavigate();

  function handleLogout() {
    clearAuth();
    navigate("/login");
  }

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={(theme) => ({
        // Fondo sólido para esquinas “cuadradas”
        bgcolor: theme.palette.mode === "light" ? "#ffffff" : "#111827",
        color: theme.palette.mode === "light" ? "#0f172a" : "#e5e7eb",

        // Separador inferior sutil
        borderBottom:
          theme.palette.mode === "light"
            ? "1px solid rgba(15, 23, 42, 0.08)"
            : "1px solid rgba(229, 231, 235, 0.12)",

        // Clave: sin blur y sin radios
        backdropFilter: "none",
        borderRadius: 0,
        boxShadow: theme.shadows[1],
      })}
    >
      <Toolbar sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "inherit" }}>
          Control Fichajes
        </Typography>

        {isLoggedIn() && (
          <>
            <Button sx={{ color: "inherit" }} component={Link} to="/">Dashboard</Button>
            <Button sx={{ color: "inherit" }} component={Link} to="/fichar">Fichar</Button>
            <Button sx={{ color: "inherit" }} component={Link} to="/incidencias">Incidencias</Button>
            {isAdmin() && (
              <Button sx={{ color: "inherit" }} component={Link} to="/admin">
                Admin
              </Button>
            )}
          </>
        )}

        <IconButton
          color="inherit"
          onClick={toggleMode}
          aria-label="Cambiar tema"
          sx={{
            ml: 1,
            borderRadius: 0, // opcional: icon button cuadrado también
          }}
        >
          {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        {auth ? (
          <Button sx={{ color: "inherit", borderRadius: 0 }} onClick={handleLogout}>
            Salir
          </Button>
        ) : (
          <Button sx={{ color: "inherit", borderRadius: 0 }} component={Link} to="/login">
            Entrar
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default function App() {
  const APPBAR_HEIGHT = 64; // 56 si usas Toolbar "dense" en móvil

  return (
    <BrowserRouter>
      <TopBar />
      {/* Contenido a pantalla completa bajo la AppBar fija */}
      <Box
        component="main"
        sx={{
          pt: `${APPBAR_HEIGHT}px`,
          minHeight: `calc(100dvh - ${APPBAR_HEIGHT}px)`,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          // Fondo según tema (opcional)
          bgcolor: "background.default",
        }}
      >
        <Routes>
          {/* Público */}
          <Route path="/login" element={<Login />} />

          {/* Protegidas */}
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/fichar" element={<PrivateRoute><Fichar /></PrivateRoute>} />
          <Route path="/incidencias" element={<PrivateRoute><Incidencias /></PrivateRoute>} />

          {/* Solo Admin */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
}