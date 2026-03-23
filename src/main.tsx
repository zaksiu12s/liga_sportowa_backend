import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Admin/Toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
        <Analytics />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
);
