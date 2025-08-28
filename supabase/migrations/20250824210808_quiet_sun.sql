/*
  # Fix RLS policy for user_profiles table

  1. Problem
    - The existing RLS policy is not allowing INSERT operations for authenticated users
    - Users cannot create new profiles due to policy violations

  2. Solution
    - Drop all existing policies on user_profiles
    - Create a comprehensive policy that allows all operations for authenticated users
    - Ensure the policy is properly applied
*/

-- Drop all existing policies on user_profiles
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Allow users to delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a single comprehensive policy for all operations
CREATE POLICY "authenticated_users_all_access" 
  ON user_profiles 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;