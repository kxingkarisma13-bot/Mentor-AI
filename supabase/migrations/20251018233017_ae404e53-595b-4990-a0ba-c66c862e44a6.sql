-- Fix function search path security warnings

-- Update detect_sensitive_data to set search_path
CREATE OR REPLACE FUNCTION public.detect_sensitive_data(input_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check for credit card patterns (basic Luhn algorithm patterns)
  IF input_text ~ '\d{13,19}' OR 
     input_text ~ '\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}' THEN
    RETURN true;
  END IF;
  
  -- Check for SSN patterns (XXX-XX-XXXX)
  IF input_text ~ '\d{3}[-\s]?\d{2}[-\s]?\d{4}' THEN
    RETURN true;
  END IF;
  
  -- Check for bank account patterns (routing + account number)
  IF input_text ~ '\d{9}[\s-]?\d{6,17}' THEN
    RETURN true;
  END IF;
  
  -- Check for CVV patterns (standalone 3-4 digits with keywords)
  IF input_text ~* '(cvv|cvc|security\s+code)[\s:]*\d{3,4}' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Update prevent_sensitive_data_in_messages to set search_path
CREATE OR REPLACE FUNCTION public.prevent_sensitive_data_in_messages()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check if message contains sensitive data patterns
  IF public.detect_sensitive_data(NEW.content) THEN
    RAISE EXCEPTION 'Message contains potentially sensitive information (credit cards, SSN, bank accounts). Please do not share such information in messages.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update prevent_sensitive_data_in_notes to set search_path
CREATE OR REPLACE FUNCTION public.prevent_sensitive_data_in_notes()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Check notes field if it exists and is not null
  IF NEW.notes IS NOT NULL AND public.detect_sensitive_data(NEW.notes) THEN
    RAISE EXCEPTION 'Notes contain potentially sensitive information (credit cards, SSN, bank accounts). Please do not store such information.';
  END IF;
  
  RETURN NEW;
END;
$$;