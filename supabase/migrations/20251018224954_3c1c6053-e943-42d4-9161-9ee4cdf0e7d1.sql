-- Create role enum type
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for managing user permissions
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create verification audit table
CREATE TABLE public.verification_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES public.professionals(id) ON DELETE CASCADE,
  verified_by uuid REFERENCES auth.users(id),
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.verification_audit ENABLE ROW LEVEL SECURITY;

-- Update professionals RLS policies to prevent self-verification
DROP POLICY IF EXISTS "Professionals can update their own profile" ON public.professionals;

CREATE POLICY "Professionals can update own profile except verification"
ON public.professionals FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  is_verified = (SELECT is_verified FROM public.professionals WHERE id = professionals.id)
);

-- Admin-only policy for professional verification
CREATE POLICY "Admins can verify professionals"
ON public.professionals FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add UPDATE policy for consultation_messages (read receipts)
CREATE POLICY "Recipients can mark messages as read"
ON public.consultation_messages FOR UPDATE
USING (
  sender_id != auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.consultations c
    WHERE c.id = consultation_messages.consultation_id
    AND (c.user_id = auth.uid() OR c.professional_id IN (
      SELECT id FROM public.professionals WHERE user_id = auth.uid()
    ))
  )
)
WITH CHECK (is_read = true);

-- RLS policies for user_roles (only viewable by the user themselves)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS policies for verification_audit (admins only)
CREATE POLICY "Admins can view verification audit"
ON public.verification_audit FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert verification audit"
ON public.verification_audit FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));