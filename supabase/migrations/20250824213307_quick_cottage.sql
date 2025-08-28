/*
  # Désactiver temporairement RLS pour permettre l'accès aux données

  1. Problème
    - Les politiques RLS empêchent l'accès aux données
    - L'authentification a été supprimée de l'application

  2. Solution temporaire
    - Désactiver RLS sur toutes les tables principales
    - Permettre l'accès public aux données pour les tests
    - Cette solution est TEMPORAIRE et ne doit PAS être utilisée en production
*/

-- Désactiver RLS sur toutes les tables principales
ALTER TABLE stock_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE tool_locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors DISABLE ROW LEVEL SECURITY;
ALTER TABLE machines DISABLE ROW LEVEL SECURITY;
ALTER TABLE material_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE tool_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE tools DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_references DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE productions DISABLE ROW LEVEL SECURITY;

-- Garder RLS activé sur les tables d'authentification (non utilisées)
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- Ajouter quelques données de test si les tables sont vides
INSERT INTO materials (material_type_id, lot_number, diameter, cases_count, weight_kg, supplier, alert_threshold)
SELECT 
  (SELECT id FROM material_types WHERE name = 'Inox' LIMIT 1),
  'LOT-INOX-2024-001',
  12,
  5,
  125.5,
  'Fournisseur Inox SA',
  50.0
WHERE NOT EXISTS (SELECT 1 FROM materials LIMIT 1);

INSERT INTO tools (tool_type_id, tool_location_id, reference, description, quantity, alert_threshold)
SELECT 
  (SELECT id FROM tool_types WHERE name = 'Foret' LIMIT 1),
  (SELECT id FROM tool_locations WHERE name = 'Magasin Principal' LIMIT 1),
  'FOR-HSS-12',
  'Foret HSS diamètre 12mm',
  25,
  5
WHERE NOT EXISTS (SELECT 1 FROM tools LIMIT 1);

INSERT INTO stock_products (reference, description, stock_location_id, quantity)
SELECT 
  'REF-001',
  'Pièce usinée référence 001',
  (SELECT id FROM stock_locations WHERE name = 'Produits Finis' LIMIT 1),
  1500
WHERE NOT EXISTS (SELECT 1 FROM stock_products LIMIT 1);

INSERT INTO productions (machine_id, cadence, material_type, material_lot, reference, order_number, quantity, produced, status)
SELECT 
  (SELECT id FROM machines WHERE name = 'Machine 1' LIMIT 1),
  120,
  'Inox',
  'LOT-INOX-2024-001',
  'REF-001',
  'OF-2024-001',
  500,
  350,
  'running'
WHERE NOT EXISTS (SELECT 1 FROM productions LIMIT 1);

-- Afficher un message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'RLS désactivé sur les tables principales. Application prête à être utilisée sans authentification.';
END $$;