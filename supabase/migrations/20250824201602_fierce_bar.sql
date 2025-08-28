/*
  # Corriger la contrainte unique manquante et créer le profil

  1. Problème identifié
    - La table user_profiles n'a pas de contrainte unique sur user_id
    - Cela empêche l'utilisation de ON CONFLICT (user_id)
    - Le profil utilisateur n'existe pas

  2. Solution
    - Ajouter la contrainte unique sur user_id
    - Créer le profil manquant
    - Vérifier que tout fonctionne
*/

-- Ajouter la contrainte unique sur user_id si elle n'existe pas
DO $$
BEGIN
    -- Vérifier si la contrainte existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_user_id_key' 
        AND table_name = 'user_profiles'
    ) THEN
        -- Supprimer les doublons potentiels avant d'ajouter la contrainte
        DELETE FROM user_profiles a USING user_profiles b 
        WHERE a.id > b.id AND a.user_id = b.user_id;
        
        -- Ajouter la contrainte unique
        ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
    END IF;
END $$;

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