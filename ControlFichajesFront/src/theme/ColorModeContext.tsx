import { createContext, useContext } from "react";

export type ColorModeContextValue = {
  mode: "light" | "dark";
  toggleMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue>({
  mode: "light",
  toggleMode: () => {},
});

export const useColorModeContext = () => useContext(ColorModeContext);