-- 1. Fix: Customer Email and Phone Numbers Could Be Stolen
-- Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create stricter policies that require authentication
CREATE POLICY "Authenticated users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- 2. Fix: System Notifications Could Be Forged by Users
-- Add INSERT policy that blocks all direct inserts (only system/triggers can insert)
CREATE POLICY "No direct insert for notifications" 
ON public.notifications 
FOR INSERT 
TO authenticated
WITH CHECK (false);

-- 3. Fix: Property Owner Identity Exposed to Public
-- Create a secure view that hides owner_id for non-owners
CREATE OR REPLACE VIEW public.properties_public AS
SELECT 
  id,
  title,
  description,
  price,
  city,
  neighborhood,
  address,
  type,
  rooms,
  bathrooms,
  surface,
  is_premium,
  is_published,
  views,
  created_at,
  updated_at,
  CASE 
    WHEN auth.uid() = owner_id THEN owner_id 
    ELSE NULL 
  END as owner_id
FROM public.properties
WHERE is_published = true OR auth.uid() = owner_id;