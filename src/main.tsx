import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Stability fixes for production / multi-device usage:
 * 1) If the app is using HashRouter but a user lands on a clean URL like /messages
 *    (open-in-new-tab, link from social apps, etc.), rewrite to /#/messages.
 * 2) If a deployment causes a stale cached bundle and a chunk fails to load,
 *    reload once to recover (prevents “white screen” after updates).
 */
const bootstrapClientStability = () => {
  // --- 1) HashRouter URL normalization
  if (!window.location.hash) {
    const { pathname, search } = window.location;

    // Only rewrite real app routes (not assets) and only if not already on “/”
    const looksLikeFile = /\.[a-zA-Z0-9]+$/.test(pathname);
    if (pathname && pathname !== "/" && !looksLikeFile) {
      window.location.replace(`/#${pathname}${search}`);
      return;
    }
  }

  // --- 2) Chunk-load recovery (handles occasional blank screen after updates)
  const reloadKey = "domia:chunk_reload_once";
  const reloadOnce = () => {
    if (sessionStorage.getItem(reloadKey)) return;
    sessionStorage.setItem(reloadKey, "1");
    window.location.reload();
  };

  window.addEventListener("vite:preloadError", reloadOnce as EventListener);

  const isChunkErrorMessage = (message?: string | null) => {
    if (!message) return false;
    return /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      message
    );
  };

  window.addEventListener("error", (event) => {
    const msg = (event as ErrorEvent).message;
    if (isChunkErrorMessage(msg)) reloadOnce();
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = (event as PromiseRejectionEvent).reason as any;
    const msg = typeof reason === "string" ? reason : reason?.message;
    if (isChunkErrorMessage(msg)) reloadOnce();
  });
};

bootstrapClientStability();

createRoot(document.getElementById("root")!).render(<App />);
