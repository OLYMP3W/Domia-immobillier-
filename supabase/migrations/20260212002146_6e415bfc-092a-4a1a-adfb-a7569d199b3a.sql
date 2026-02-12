
-- Fonction publique pour obtenir les statistiques du site sans RLS
CREATE OR REPLACE FUNCTION public.get_public_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'properties', (SELECT count(*) FROM properties WHERE is_published = true),
    'owners', (SELECT count(*) FROM user_roles WHERE role = 'owner'),
    'tenants', (SELECT count(*) FROM user_roles WHERE role = 'tenant'),
    'users', (SELECT count(*) FROM profiles)
  ) INTO result;
  RETURN result;
END;
$$;
