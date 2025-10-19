-- Create workout records table
CREATE TABLE IF NOT EXISTS public.workout_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workout_plan_id uuid REFERENCES public.workout_plans(id),
  workout_name text NOT NULL,
  duration_minutes integer NOT NULL,
  calories_burned integer NOT NULL,
  exercises_completed jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_records ENABLE ROW LEVEL SECURITY;

-- Create policies for workout records
CREATE POLICY "Users can view own workout records"
  ON public.workout_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout records"
  ON public.workout_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout records"
  ON public.workout_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout records"
  ON public.workout_records
  FOR DELETE
  USING (auth.uid() = user_id);