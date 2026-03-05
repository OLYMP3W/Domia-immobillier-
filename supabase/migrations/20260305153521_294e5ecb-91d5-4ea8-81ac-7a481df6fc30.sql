
-- Function to get owner contact info (accessible to all authenticated users)
CREATE OR REPLACE FUNCTION public.get_owner_contact(owner_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'phone', p.phone,
    'whatsapp', p.whatsapp
  ) INTO result
  FROM public.profiles p
  WHERE p.user_id = owner_user_id;
  
  RETURN result;
END;
$$;
