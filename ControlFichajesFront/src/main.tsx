import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ThemeProviderWithMode from "./theme/ThemeProviderWithMode";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProviderWithMode>
      <App />
    </ThemeProviderWithMode>
  </React.StrictMode>
);