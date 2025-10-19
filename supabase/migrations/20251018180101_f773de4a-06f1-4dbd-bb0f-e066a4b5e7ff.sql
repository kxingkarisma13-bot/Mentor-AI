-- Fix function search paths for security - drop triggers first
DROP TRIGGER IF EXISTS update_rating_after_review ON public.professional_reviews;
DROP TRIGGER IF EXISTS update_professionals_updated_at ON public.professionals;
DROP TRIGGER IF EXISTS update_consultations_updated_at ON public.consultations;

DROP FUNCTION IF EXISTS update_professional_rating();
DROP FUNCTION IF EXISTS update_updated_at_column();

CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_rating_after_review
  AFTER INSERT ON public.professional_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_rating();

CREATE TRIGGER update_professionals_updated_at
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();