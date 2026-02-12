-- Permettre aux utilisateurs de supprimer leurs propres messages
CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
