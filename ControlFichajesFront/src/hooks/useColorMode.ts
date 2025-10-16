import { createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function getStoredMode(): PaletteMode {
  const m = localStorage.getItem("color-mode");
  return m === "dark" || m === "light" ? m : "light";
}

export function useColorMode() {
  const [mode, setMode] = useState<PaletteMode>(getStoredMode());

  useEffect(() => {
    localStorage.setItem("color-mode", mode);
    document.documentElement.setAttribute("data-color-mode", mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: mode === "light"
          ? {
              mode: "light",
              primary: { main: "#5184f1ff", light: "#5b8cfa", dark: "#1e4fc0", contrastText: "#ffffff" },
              secondary: { main: "#f97316", light: "#ff9a4a", dark: "#c85b11", contrastText: "#ffffff" },
              background: { default: "#e6e6ecff", paper: "#ffffff" },
              text: { primary: "#0f172a", secondary: "#475569" },
              divider: "rgba(15, 23, 42, 0.08)",
            }
          : {
              mode: "dark",
              primary: { main: "#90caf9", light: "#b3dafb", dark: "#5f8ab2", contrastText: "#081018" },
              secondary: { main: "#f59e0b", light: "#fbbf24", dark: "#d97706", contrastText: "#0b0f19" },
              background: { default: "#0b0f19", paper: "#111827" },
              text: { primary: "#e5e7eb", secondary: "#9ca3af" },
              divider: "rgba(229, 231, 235, 0.12)",
            },
        typography: {
          fontFamily: `Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
          h5: { fontWeight: 600 },
          button: { textTransform: "none", fontWeight: 600 },
        },
        shape: { borderRadius: 12 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === "light" ? "#f7f7fb" : "#0b0f19",
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                boxShadow:
                  mode === "light"
                    ? "0 1px 2px rgba(16,24,40,0.04), 0 1px 3px rgba(16,24,40,0.08)"
                    : "0 1px 2px rgba(0,0,0,0.4)",
              },
            },
          },
          MuiTypography: {
            styleOverrides: {
              root: {
                color: mode === "light" ? "#0f172a" : "#e5e7eb",
              },
            },
          },
          MuiLink: {
            styleOverrides: {
              root: {
                color: mode === "light" ? "#1e40af" : "#93c5fd",
                textDecorationColor: mode === "light" ? "rgba(30,64,175,0.4)" : "rgba(147,197,253,0.4)",
              },
            },
          },
          MuiAppBar: {
            defaultProps: { color: "transparent" },
          },
          MuiTableHead: {
            styleOverrides: {
              root: {
                backgroundColor: mode === "light" ? "#f1f5f9" : "#0f172a",
              },
            },
          },
          MuiTableCell: {
            styleOverrides: {
              head: { fontWeight: 600, color: mode === "light" ? "#0f172a" : "#e5e7eb" },
            },
          },
          MuiChip: { styleOverrides: { root: { borderRadius: 8 } } },
          MuiButton: { defaultProps: { variant: "contained" }, styleOverrides: { root: { borderRadius: 10 } } },
        },
      }),
    [mode]
  );

  const toggleMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  return { theme, mode, toggleMode };
}