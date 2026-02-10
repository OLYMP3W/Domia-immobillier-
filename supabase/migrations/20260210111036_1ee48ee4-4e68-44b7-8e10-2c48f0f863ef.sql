
-- Ajouter colonne WhatsApp au profil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp TEXT;
