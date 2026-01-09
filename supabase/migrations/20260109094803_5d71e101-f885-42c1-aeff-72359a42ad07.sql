-- Fix: Remove SECURITY DEFINER view issue
-- Drop the view and recreate without exposing owner_id at all for non-owners
DROP VIEW IF EXISTS public.properties_public;

-- Instead of a view, we'll handle this in the application layer
-- The RLS policy already restricts access, we just need to be careful in the code