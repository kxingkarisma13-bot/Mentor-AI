-- Remove the public policy that exposes all user data
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.user_profiles;

-- Keep only the policy that allows users to view their own profile
-- The existing "Users can view own profile" policy already handles this correctly

-- Add a policy to allow viewing only username and full_name of other users (for professional lookups, etc.)
-- This is more secure as it only exposes non-sensitive public fields
CREATE POLICY "Public usernames viewable by authenticated users"
ON public.user_profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.uid() = user_id 
    OR true  -- Allow viewing only specific fields via application logic
  )
);

-- Actually, let's be more restrictive - remove the above and only allow own profile
DROP POLICY IF EXISTS "Public usernames viewable by authenticated users" ON public.user_profiles;

-- Ensure only the user can see their own profile data
-- This policy is already created, so we're just making sure it's the only SELECT policy
CREATE POLICY "Users can only view own profile" 
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);