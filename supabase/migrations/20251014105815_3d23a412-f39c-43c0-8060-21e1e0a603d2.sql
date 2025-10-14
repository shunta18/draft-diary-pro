-- Fix contact form data exposure by restricting access to admin users only
DROP POLICY IF EXISTS "Authenticated users can view all messages" ON public.contact_messages;

CREATE POLICY "Only admins can view contact messages"
  ON public.contact_messages
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));