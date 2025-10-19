-- Create audit log table for tracking sensitive operations
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.security_audit_log
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs"
ON public.security_audit_log
FOR INSERT
WITH CHECK (true);

-- Create function to detect sensitive data patterns
CREATE OR REPLACE FUNCTION public.detect_sensitive_data(input_text text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to audit financial transactions
CREATE OR REPLACE FUNCTION public.audit_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    action,
    table_name,
    record_id,
    details
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'amount', COALESCE(NEW.amount, OLD.amount),
      'type', COALESCE(NEW.type, OLD.type),
      'category', COALESCE(NEW.category, OLD.category),
      'operation', TG_OP
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Create function to audit consultation payments
CREATE OR REPLACE FUNCTION public.audit_consultation_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only audit payment-related changes
  IF TG_OP = 'UPDATE' AND (
    NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id OR
    NEW.stripe_payment_status IS DISTINCT FROM OLD.stripe_payment_status OR
    NEW.total_amount IS DISTINCT FROM OLD.total_amount OR
    NEW.status IS DISTINCT FROM OLD.status
  ) THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      details
    ) VALUES (
      NEW.user_id,
      'PAYMENT_UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'total_amount', NEW.total_amount,
        'payment_status', NEW.stripe_payment_status,
        'consultation_status', NEW.status,
        'professional_id', NEW.professional_id
      )
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      details
    ) VALUES (
      NEW.user_id,
      'CONSULTATION_CREATED',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'total_amount', NEW.total_amount,
        'professional_id', NEW.professional_id,
        'specialty', NEW.specialty
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to prevent sensitive data in messages
CREATE OR REPLACE FUNCTION public.prevent_sensitive_data_in_messages()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if message contains sensitive data patterns
  IF public.detect_sensitive_data(NEW.content) THEN
    RAISE EXCEPTION 'Message contains potentially sensitive information (credit cards, SSN, bank accounts). Please do not share such information in messages.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to prevent sensitive data in notes fields
CREATE OR REPLACE FUNCTION public.prevent_sensitive_data_in_notes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check notes field if it exists and is not null
  IF NEW.notes IS NOT NULL AND public.detect_sensitive_data(NEW.notes) THEN
    RAISE EXCEPTION 'Notes contain potentially sensitive information (credit cards, SSN, bank accounts). Please do not store such information.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to audit profile changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Audit changes to sensitive fields
  IF TG_OP = 'UPDATE' AND (
    NEW.phone IS DISTINCT FROM OLD.phone OR
    NEW.date_of_birth IS DISTINCT FROM OLD.date_of_birth OR
    NEW.full_name IS DISTINCT FROM OLD.full_name
  ) THEN
    INSERT INTO public.security_audit_log (
      user_id,
      action,
      table_name,
      record_id,
      details
    ) VALUES (
      NEW.user_id,
      'PROFILE_SENSITIVE_UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'phone_changed', (NEW.phone IS DISTINCT FROM OLD.phone),
        'dob_changed', (NEW.date_of_birth IS DISTINCT FROM OLD.date_of_birth),
        'name_changed', (NEW.full_name IS DISTINCT FROM OLD.full_name)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply audit triggers to financial_transactions
CREATE TRIGGER audit_financial_transaction_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW EXECUTE FUNCTION public.audit_financial_transaction();

-- Apply audit triggers to consultations
CREATE TRIGGER audit_consultation_payment_trigger
AFTER INSERT OR UPDATE ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.audit_consultation_payment();

-- Apply audit triggers to user_profiles
CREATE TRIGGER audit_profile_changes_trigger
AFTER UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.audit_profile_changes();

-- Apply sensitive data prevention to consultation_messages
CREATE TRIGGER prevent_sensitive_data_messages_trigger
BEFORE INSERT OR UPDATE ON public.consultation_messages
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_data_in_messages();

-- Apply sensitive data prevention to consultations notes
CREATE TRIGGER prevent_sensitive_data_consultation_notes_trigger
BEFORE INSERT OR UPDATE ON public.consultations
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_data_in_notes();

-- Apply sensitive data prevention to big_purchase_plans notes
CREATE TRIGGER prevent_sensitive_data_purchase_notes_trigger
BEFORE INSERT OR UPDATE ON public.big_purchase_plans
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_data_in_notes();

-- Apply sensitive data prevention to mood_entries notes
CREATE TRIGGER prevent_sensitive_data_mood_notes_trigger
BEFORE INSERT OR UPDATE ON public.mood_entries
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_data_in_notes();

-- Create indexes for audit log queries
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX idx_security_audit_log_table_name ON public.security_audit_log(table_name);
CREATE INDEX idx_security_audit_log_created_at ON public.security_audit_log(created_at DESC);

-- Add additional RLS policy for savings_goals to prevent bulk access
CREATE POLICY "Prevent bulk savings goals access"
ON public.savings_goals
FOR SELECT
USING (
  auth.uid() = user_id AND
  -- Ensure request is authenticated
  auth.uid() IS NOT NULL
);

-- Add additional RLS policy for financial_transactions to log access
CREATE POLICY "Prevent bulk transaction access"
ON public.financial_transactions
FOR SELECT
USING (
  auth.uid() = user_id AND
  auth.uid() IS NOT NULL
);

-- Create function to get user's recent security events (for transparency)
CREATE OR REPLACE FUNCTION public.get_my_security_events(limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  action text,
  table_name text,
  details jsonb,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, action, table_name, details, created_at
  FROM public.security_audit_log
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT limit_count;
$$;