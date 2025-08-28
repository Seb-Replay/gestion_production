/*
  # Correction des politiques RLS pour user_profiles

  1. Problème identifié
    - La politique "Admins can read all profiles" cause des erreurs 500
    - Elle est redondante avec "Admins can manage all profiles"
    - Elle peut créer des conflits pour les utilisateurs non-admin

  2. Solution
    - Supprimer la politique problématique
    - Conserver les politiques fonctionnelles
*/

-- Supprimer la politique RLS problématique
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;

-- Vérifier que les autres politiques sont toujours en place
-- (Ces politiques devraient déjà exister depuis la migration précédente)

-- Politique pour que les utilisateurs puissent lire leur propre profil
-- CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Politique pour que les admins puissent tout gérer (inclut déjà SELECT)
-- CREATE POLICY "Admins can manage all profiles" ON user_profiles FOR ALL TO authenticated USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE user_id = auth.uid() AND role = 'admin'
--   )
-- );