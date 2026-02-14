
-- Table pour stocker les abonnements push
CREATE TABLE public.push_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own subscriptions"
ON public.push_subscriptions
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger pour envoyer une notification push quand un message est inséré
CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Récupérer le nom de l'expéditeur
  SELECT fullname INTO sender_name FROM public.profiles WHERE user_id = NEW.sender_id LIMIT 1;
  
  -- Créer une notification en base
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.receiver_id,
    'Nouveau message',
    COALESCE(sender_name, 'Quelqu''un') || ' vous a envoyé un message',
    'message'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_message();
