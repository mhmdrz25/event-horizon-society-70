
-- Fix for Function Search Path Mutable Security Issue
-- Update get_user_role function with explicit search_path
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS user_role
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.users WHERE id = auth.uid();
$function$;

-- Update handle_new_user function with explicit search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'student'
  );
  RETURN NEW;
END;
$function$;

-- Fix notifications table creation issue
-- Using IF NOT EXISTS to prevent "relation already exists" error
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Add RLS policies for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY IF NOT EXISTS "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Administrators can view all notifications
CREATE POLICY IF NOT EXISTS "Admins can view all notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
