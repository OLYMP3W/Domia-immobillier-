
-- =========================================
-- DOMIA FULL UPGRADE - Messaging, Admin, Media
-- =========================================

-- 1. Table conversations pour le chat temps réel
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL,
  participant_2 UUID NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT unique_conversation UNIQUE(participant_1, participant_2, property_id)
);

-- 2. Ajouter conversation_id aux messages existants
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE;

-- 3. Table pour médias (images + vidéos)
CREATE TABLE IF NOT EXISTS public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Table admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insérer l'admin par défaut
INSERT INTO public.admin_users (email) 
VALUES ('infodomia7@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 5. Table pour tracker les installations PWA
CREATE TABLE IF NOT EXISTS public.app_installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Table pour signaler des propriétés
CREATE TABLE IF NOT EXISTS public.reported_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- 7. Stats du site
CREATE TABLE IF NOT EXISTS public.site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,
  total_users INTEGER DEFAULT 0,
  total_owners INTEGER DEFAULT 0,
  total_tenants INTEGER DEFAULT 0,
  total_properties INTEGER DEFAULT 0,
  total_installs INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_installs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- =========================================
-- FUNCTIONS
-- =========================================

-- Fonction pour vérifier admin par email
CREATE OR REPLACE FUNCTION public.is_admin_by_email(_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = _email
  )
$$;

-- Fonction pour créer/récupérer conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
  p_user_1 UUID,
  p_user_2 UUID,
  p_property_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id UUID;
BEGIN
  SELECT id INTO conv_id
  FROM public.conversations
  WHERE (
    (participant_1 = p_user_1 AND participant_2 = p_user_2)
    OR (participant_1 = p_user_2 AND participant_2 = p_user_1)
  )
  AND (
    (property_id = p_property_id) 
    OR (property_id IS NULL AND p_property_id IS NULL)
  )
  LIMIT 1;
  
  IF conv_id IS NULL THEN
    INSERT INTO public.conversations (participant_1, participant_2, property_id)
    VALUES (p_user_1, p_user_2, p_property_id)
    RETURNING id INTO conv_id;
  END IF;
  
  RETURN conv_id;
END;
$$;

-- =========================================
-- RLS POLICIES
-- =========================================

-- Conversations
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Property Media
CREATE POLICY "Anyone can view property media"
ON public.property_media FOR SELECT USING (true);

CREATE POLICY "Owners can insert property media"
ON public.property_media FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_media.property_id 
  AND properties.owner_id = auth.uid()
));

CREATE POLICY "Owners can update property media"
ON public.property_media FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_media.property_id 
  AND properties.owner_id = auth.uid()
));

CREATE POLICY "Owners can delete property media"
ON public.property_media FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_media.property_id 
  AND properties.owner_id = auth.uid()
));

-- App Installs
CREATE POLICY "Anyone can insert install"
ON public.app_installs FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own installs"
ON public.app_installs FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Reported Properties
CREATE POLICY "Users can report properties"
ON public.reported_properties FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
ON public.reported_properties FOR SELECT
USING (auth.uid() = reporter_id);

-- Admin Users (no direct access)
CREATE POLICY "No direct access to admin_users"
ON public.admin_users FOR SELECT USING (false);

-- Site Stats (no direct access - use edge function)
CREATE POLICY "No direct access to site_stats"
ON public.site_stats FOR SELECT USING (false);

-- =========================================
-- ENABLE REALTIME
-- =========================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
