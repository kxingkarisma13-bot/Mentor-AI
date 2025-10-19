-- Create mood_entries table for tracking user moods
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  emotion TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mood_entries
CREATE POLICY "Users can view own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Create big_purchase_plans table
CREATE TABLE public.big_purchase_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_type TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_savings NUMERIC DEFAULT 0,
  target_date DATE,
  monthly_budget NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.big_purchase_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for big_purchase_plans
CREATE POLICY "Users can view own purchase plans"
  ON public.big_purchase_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchase plans"
  ON public.big_purchase_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchase plans"
  ON public.big_purchase_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchase plans"
  ON public.big_purchase_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_big_purchase_plans_updated_at
  BEFORE UPDATE ON public.big_purchase_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();