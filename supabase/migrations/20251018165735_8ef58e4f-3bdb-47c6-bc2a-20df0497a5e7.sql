-- Create enum for professional specialties
CREATE TYPE professional_specialty AS ENUM (
  'finance',
  'mental_wellness',
  'life_skills',
  'career',
  'legal',
  'health',
  'education',
  'technology',
  'business'
);

-- Create enum for consultation status
CREATE TYPE consultation_status AS ENUM (
  'pending',
  'active',
  'completed',
  'cancelled'
);

-- Professionals table
CREATE TABLE public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialties professional_specialty[] NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  years_experience INTEGER NOT NULL,
  certifications TEXT[],
  profile_image_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  total_consultations INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  specialty professional_specialty NOT NULL,
  status consultation_status DEFAULT 'pending' NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_payment_status TEXT,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Consultation messages table
CREATE TABLE public.consultation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Professional reviews table
CREATE TABLE public.professional_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(consultation_id)
);

-- Enable Row Level Security
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professionals
CREATE POLICY "Professionals viewable by everyone"
  ON public.professionals FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their professional profile"
  ON public.professionals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Professionals can update their own profile"
  ON public.professionals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for consultations
CREATE POLICY "Users can view their own consultations"
  ON public.consultations FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.professionals WHERE id = professional_id
  ));

CREATE POLICY "Users can create consultations"
  ON public.consultations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Participants can update consultation"
  ON public.consultations FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() IN (
    SELECT user_id FROM public.professionals WHERE id = professional_id
  ));

-- RLS Policies for consultation messages
CREATE POLICY "Consultation participants can view messages"
  ON public.consultation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.user_id = auth.uid() OR c.professional_id IN (
        SELECT id FROM public.professionals WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Consultation participants can send messages"
  ON public.consultation_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.consultations c
      WHERE c.id = consultation_id
      AND (c.user_id = auth.uid() OR c.professional_id IN (
        SELECT id FROM public.professionals WHERE user_id = auth.uid()
      ))
    )
  );

-- RLS Policies for professional reviews
CREATE POLICY "Reviews viewable by everyone"
  ON public.professional_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their consultations"
  ON public.professional_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.consultations
      WHERE id = consultation_id
      AND user_id = auth.uid()
      AND status = 'completed'
    )
  );

-- Function to update professional average rating
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.professionals
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.professional_reviews
      WHERE professional_id = NEW.professional_id
    ),
    updated_at = now()
  WHERE id = NEW.professional_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating after review
CREATE TRIGGER update_rating_after_review
  AFTER INSERT ON public.professional_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_messages;