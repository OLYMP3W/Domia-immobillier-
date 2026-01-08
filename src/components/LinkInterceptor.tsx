import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const isModifiedEvent = (event: MouseEvent | TouchEvent) =>
  "metaKey" in event && (event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

const isAssetPath = (href: string) =>
  /\.(png|jpe?g|gif|svg|webp|pdf|zip|mp4|webm|mov|ico)(\?.*)?$/i.test(href);

/**
 * Fix mobile "Not Found" / white screen:
 * - Intercepts clicks/touches on <a> links and forces SPA navigation
 * - Works with HashRouter (/#/path) or regular paths
 */
export const LinkInterceptor = () => {
  const navigate = useNavigate();
  const lastTouchHandledAtRef = useRef<number>(0);

  const handleNavigation = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (e.defaultPrevented) return;

      // On mobile, a touch can fire touchend + a synthetic click; avoid double navigation.
      if (e.type === "click" && Date.now() - lastTouchHandledAtRef.current < 800) return;

      // Only primary button for mouse
      if ("button" in e && e.button !== 0) return;
      if (isModifiedEvent(e)) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      // Skip external links or download links
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href") || "";
      if (!rawHref) return;
      if (rawHref === "#" || rawHref.startsWith("#")) return;

      // Prevent "./" or "." from turning into /#/.
      if (rawHref === "." || rawHref === "./") {
        e.preventDefault();
        // allow bubbling so component onClick still runs
        if (e.type === "touchend") lastTouchHandledAtRef.current = Date.now();
        navigate("/");
        return;
      }

      // Skip mailto/tel/sms links
      if (/^(mailto|tel|sms):/.test(rawHref)) return;

      // Handle absolute URLs (same origin only)
      if (/^https?:\/\//i.test(rawHref)) {
        try {
          const url = new URL(rawHref);
          if (url.origin !== window.location.origin) return;

          // HashRouter links like https://site/#/properties
          if (url.hash?.startsWith("#/")) {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "touchend") lastTouchHandledAtRef.current = Date.now();
            navigate(url.hash.slice(1));
            return;
          }

          if (isAssetPath(url.pathname)) return;

          e.preventDefault();
          e.stopPropagation();
          if (e.type === "touchend") lastTouchHandledAtRef.current = Date.now();
          navigate(url.pathname + url.search + url.hash);
          return;
        } catch {
          return;
        }
      }

      // Relative path must start with /
      if (!rawHref.startsWith("/")) return;
      if (isAssetPath(rawHref)) return;

      // Normalize '/#/properties' -> '/properties'
      const href = rawHref.startsWith("/#/") ? rawHref.replace("/#", "") : rawHref;

      e.preventDefault();
      e.stopPropagation();
      if (e.type === "touchend") lastTouchHandledAtRef.current = Date.now();
      navigate(href);
    },
    [navigate]
  );

  useEffect(() => {
    // Use capture phase for both click and touchend to intercept before default behavior
    document.addEventListener("click", handleNavigation, true);
    document.addEventListener("touchend", handleNavigation, true);

    return () => {
      document.removeEventListener("click", handleNavigation, true);
      document.removeEventListener("touchend", handleNavigation, true);
    };
  }, [handleNavigation]);

  return null;
};
