/*
  # Créer le profil utilisateur manquant

  1. Problème identifié
    - L'utilisateur 08c9749b-6594-4cba-bb92-72bdfa163a66 existe dans auth.users
    - Mais n'a pas de profil correspondant dans user_profiles
    - Cela cause l'erreur PGRST116 "The result contains 0 rows"

  2. Solution
    - Créer le profil manquant pour cet utilisateur
    - Lui donner le rôle admin pour les tests
*/

-- Créer le profil manquant pour l'utilisateur actuel
INSERT INTO user_profiles (user_id, username, full_name, role, is_active)
VALUES (
  '08c9749b-6594-4cba-bb92-72bdfa163a66',
  'admin',
  'Administrateur',
  'admin',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Vérifier que le profil a été créé
SELECT 
  id,
  user_id,
  username,
  full_name,
  role,
  is_active,
  created_at
FROM user_profiles 
WHERE user_id = '08c9749b-6594-4cba-bb92-72bdfa163a66';