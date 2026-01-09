/**
 * SIMPLIFIED ROUTING FIX:
 * Force full page reload for all internal navigation to fix mobile white screen issues.
 * This ensures clean state on every page change.
 */
export const LinkInterceptor = () => {
  return null; // Disabled - using hard navigation instead
};
