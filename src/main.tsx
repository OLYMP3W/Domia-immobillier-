import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enregistrement du Service Worker pour les notifications push
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .catch((err) => console.warn('SW registration failed:', err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
