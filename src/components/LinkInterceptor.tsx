import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const isModifiedEvent = (event: MouseEvent) =>
  event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;

const isAssetPath = (href: string) =>
  /\.(png|jpe?g|gif|svg|webp|pdf|zip|mp4|webm|mov|ico)(\?.*)?$/i.test(href);

/**
 * Fix mobile "Not Found" / écran blanc: intercepte les clics sur <a href="/...")
 * (ou liens qui provoquent un rechargement) et force une navigation SPA.
 */
export const LinkInterceptor = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (isModifiedEvent(e)) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href") || "";
      if (!rawHref) return;
      if (rawHref === "#" || rawHref.startsWith("#")) return;
      if (
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        rawHref.startsWith("sms:")
      ) {
        return;
      }

      // Absolute URL (same origin only)
      if (/^https?:\/\//i.test(rawHref)) {
        try {
          const url = new URL(rawHref);
          if (url.origin !== window.location.origin) return;

          // HashRouter links like https://site/#/properties
          if (url.hash?.startsWith("#/")) {
            e.preventDefault();
            navigate(url.hash.slice(1));
            return;
          }

          if (isAssetPath(url.pathname)) return;

          e.preventDefault();
          navigate(url.pathname + url.search + url.hash);
          return;
        } catch {
          return;
        }
      }

      // Relative path
      if (!rawHref.startsWith("/")) return;
      if (isAssetPath(rawHref)) return;

      // Normalize '/#/properties' -> '/properties'
      const href = rawHref.startsWith("/#/") ? rawHref.replace("/#", "") : rawHref;

      e.preventDefault();
      navigate(href);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [navigate]);

  return null;
};
