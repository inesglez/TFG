import { ThemeProvider, CssBaseline } from "@mui/material";
import type { PropsWithChildren } from "react";
import { ColorModeContext } from "./ColorModeContext";
import { useColorMode } from "../hooks/useColorMode";

export default function ThemeProviderWithMode({ children }: PropsWithChildren) {
  const { theme, mode, toggleMode } = useColorMode();

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}