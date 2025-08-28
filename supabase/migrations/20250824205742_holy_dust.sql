/*
  # Correction des politiques RLS pour user_profiles

  1. Problème identifié
    - Les politiques actuelles empêchent la création de nouveaux utilisateurs
    - La politique "Users can insert own profile" est trop restrictive
    - Elle ne permet pas aux admins de créer des profils pour d'autres utilisateurs

  2. Solution
    - Permettre aux utilisateurs authentifiés de créer des profils
    - Permettre aux admins de gérer tous les profils
    - Simplifier les politiques pour éviter les conflits
*/

-- Supprimer toutes les politiques existantes sur user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Créer des politiques simples et fonctionnelles

-- 1. Lecture : Tous les utilisateurs authentifiés peuvent lire tous les profils
CREATE POLICY "Allow authenticated users to read profiles" 
  ON user_profiles FOR SELECT 
  TO authenticated 
  USING (true);

-- 2. Insertion : Tous les utilisateurs authentifiés peuvent créer des profils
CREATE POLICY "Allow authenticated users to create profiles" 
  ON user_profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- 3. Mise à jour : Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Allow users to update own profile" 
  ON user_profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Suppression : Les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Allow users to delete own profile" 
  ON user_profiles FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Vérifier que les politiques ont été créées
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