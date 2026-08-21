import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import App from "./App.jsx";
import { SessionProvider } from "./context/SessionContext";
import { DataProvider } from "./context/DataContext";
import { PanelProvider } from "./context/PanelContext";
import { ToastProvider } from "./components/ui/Toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <SessionProvider>
          <DataProvider>
            <PanelProvider>
              <App />
            </PanelProvider>
          </DataProvider>
        </SessionProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
