/*
  # Configuration finale pour production - Système de Gestion Stock et Production

  1. Nettoyage complet
    - Supprimer toutes les tables d'authentification non utilisées
    - Désactiver RLS sur toutes les tables de données
    - Nettoyer les politiques obsolètes

  2. Optimisation des données
    - Ajouter des index pour les performances
    - Mettre à jour les données de test
    - Corriger les contraintes

  3. Finalisation
    - Tables prêtes pour la production
    - Données cohérentes
    - Performance optimisée
*/

-- ========================================
-- ÉTAPE 1: NETTOYAGE DES TABLES D'AUTHENTIFICATION
-- ========================================

-- Supprimer les tables d'authentification non utilisées
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Supprimer les fonctions d'authentification
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS has_permission(text, text) CASCADE;
DROP FUNCTION IF EXISTS log_activity(text, text, jsonb) CASCADE;
DROP FUNCTION IF EXISTS create_demo_user(text, text, text, text) CASCADE;

-- ========================================
-- ÉTAPE 2: DÉSACTIVER RLS SUR TOUTES LES TABLES
-- ========================================

-- Désactiver RLS sur toutes les tables de données
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

-- Supprimer toutes les politiques RLS obsolètes
DO $$
DECLARE
    policy_record RECORD;
    table_name TEXT;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'stock_locations', 'tool_locations', 'subcontractors', 'machines',
            'material_types', 'materials', 'tool_types', 'tools',
            'product_references', 'stock_products', 'productions'
        ])
    LOOP
        FOR policy_record IN 
            SELECT policyname 
            FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = table_name
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, table_name);
        END LOOP;
    END LOOP;
END $$;

-- ========================================
-- ÉTAPE 3: OPTIMISATION DES PERFORMANCES
-- ========================================

-- Créer des index supplémentaires pour les performances
CREATE INDEX IF NOT EXISTS idx_materials_lot_number ON materials(lot_number);
CREATE INDEX IF NOT EXISTS idx_materials_supplier ON materials(supplier);
CREATE INDEX IF NOT EXISTS idx_tools_reference ON tools(reference);
CREATE INDEX IF NOT EXISTS idx_stock_products_reference ON stock_products(reference);
CREATE INDEX IF NOT EXISTS idx_productions_reference ON productions(reference);
CREATE INDEX IF NOT EXISTS idx_productions_order_number ON productions(order_number);
CREATE INDEX IF NOT EXISTS idx_product_references_reference ON product_references(reference);

-- ========================================
-- ÉTAPE 4: MISE À JOUR DES DONNÉES DE TEST
-- ========================================

-- Nettoyer et réinsérer des données de test cohérentes
DELETE FROM productions;
DELETE FROM stock_products;
DELETE FROM tools;
DELETE FROM materials;
DELETE FROM product_references;

-- Insérer des matières de test
INSERT INTO materials (material_type_id, lot_number, diameter, cases_count, weight_kg, supplier, alert_threshold, status) VALUES
((SELECT id FROM material_types WHERE name = 'Inox' LIMIT 1), 'LOT-INOX-2024-001', 12, 8, 200.5, 'Aciers Inox SA', 50.0, 'normal'),
((SELECT id FROM material_types WHERE name = 'Inox' LIMIT 1), 'LOT-INOX-2024-002', 16, 3, 45.2, 'Aciers Inox SA', 50.0, 'low'),
((SELECT id FROM material_types WHERE name = 'Titane' LIMIT 1), 'LOT-TI-2024-001', 10, 5, 125.8, 'Titane Précision', 30.0, 'normal'),
((SELECT id FROM material_types WHERE name = 'Acier' LIMIT 1), 'LOT-AC-2024-001', 14, 12, 350.0, 'Sidérurgie Moderne', 100.0, 'normal'),
((SELECT id FROM material_types WHERE name = 'Finemack' LIMIT 1), 'LOT-FM-2024-001', 8, 2, 25.5, 'Alliages Spéciaux', 20.0, 'critical');

-- Insérer des outillages de test
INSERT INTO tools (tool_type_id, tool_location_id, reference, description, quantity, alert_threshold, status) VALUES
((SELECT id FROM tool_types WHERE name = 'Foret' LIMIT 1), (SELECT id FROM tool_locations WHERE name = 'Magasin Principal' LIMIT 1), 'FOR-HSS-08', 'Foret HSS diamètre 8mm', 25, 5, 'normal'),
((SELECT id FROM tool_types WHERE name = 'Foret' LIMIT 1), (SELECT id FROM tool_locations WHERE name = 'Magasin Principal' LIMIT 1), 'FOR-HSS-12', 'Foret HSS diamètre 12mm', 3, 5, 'low'),
((SELECT id FROM tool_types WHERE name = 'Fraise' LIMIT 1), (SELECT id FROM tool_locations WHERE name = 'Atelier Zone 1' LIMIT 1), 'FRA-CAR-16', 'Fraise carbure diamètre 16mm', 15, 3, 'normal'),
((SELECT id FROM tool_types WHERE name = 'Taraud' LIMIT 1), (SELECT id FROM tool_locations WHERE name = 'Magasin Secondaire' LIMIT 1), 'TAR-M12', 'Taraud M12x1.75', 8, 2, 'normal'),
((SELECT id FROM tool_types WHERE name = 'Plaquette' LIMIT 1), (SELECT id FROM tool_locations WHERE name = 'Atelier Zone 2' LIMIT 1), 'PLA-TNMG', 'Plaquette TNMG 160408', 1, 5, 'critical');

-- Insérer des produits finis de test
INSERT INTO stock_products (reference, description, stock_location_id, quantity, unit, status) VALUES
('REF-001', 'Vis inox M12x50 tête hexagonale', (SELECT id FROM stock_locations WHERE name = 'Produits Finis' LIMIT 1), 2500, 'pcs', 'normal'),
('REF-002', 'Axe titane Ø10x80', (SELECT id FROM stock_locations WHERE name = 'Sortie de Production' LIMIT 1), 150, 'pcs', 'normal'),
('REF-003', 'Bague acier Ø25x15x10', (SELECT id FROM stock_locations WHERE name = 'Au Contrôle' LIMIT 1), 800, 'pcs', 'normal'),
('REF-004', 'Pion finemack Ø8x25', (SELECT id FROM stock_locations WHERE name = 'En Sous-traitance' LIMIT 1), 50, 'pcs', 'low'),
('REF-005', 'Douille inox Ø16x30x20', (SELECT id FROM stock_locations WHERE name = 'Retour Sous-traitance' LIMIT 1), 300, 'pcs', 'normal');

-- Insérer des références produits
INSERT INTO product_references (reference, order_number, material_lot, machine_id, quantity, status) VALUES
('REF-001', 'OF-2024-001', 'LOT-INOX-2024-001', (SELECT id FROM machines WHERE name = 'Machine 1' LIMIT 1), 3000, 'active'),
('REF-002', 'OF-2024-002', 'LOT-TI-2024-001', (SELECT id FROM machines WHERE name = 'Machine 3' LIMIT 1), 200, 'completed'),
('REF-003', 'OF-2024-003', 'LOT-AC-2024-001', (SELECT id FROM machines WHERE name = 'Machine 2' LIMIT 1), 1000, 'pending'),
('REF-006', 'OF-2024-006', 'LOT-INOX-2024-002', (SELECT id FROM machines WHERE name = 'Machine 4' LIMIT 1), 500, 'active');

-- Insérer des productions en cours
INSERT INTO productions (machine_id, cadence, material_type, material_lot, reference, order_number, quantity, produced, start_time, estimated_end, status) VALUES
((SELECT id FROM machines WHERE name = 'Machine 1' LIMIT 1), 120, 'Inox', 'LOT-INOX-2024-001', 'REF-001', 'OF-2024-001', 3000, 2500, '08:00', '16:30', 'running'),
((SELECT id FROM machines WHERE name = 'Machine 3' LIMIT 1), 85, 'Titane', 'LOT-TI-2024-001', 'REF-002', 'OF-2024-002', 200, 200, '09:15', '14:45', 'completed'),
((SELECT id FROM machines WHERE name = 'Machine 4' LIMIT 1), 95, 'Inox', 'LOT-INOX-2024-002', 'REF-006', 'OF-2024-006', 500, 150, '10:30', '17:00', 'paused'),
((SELECT id FROM machines WHERE name = 'Machine 2' LIMIT 1), 0, 'Acier', 'LOT-AC-2024-001', 'REF-003', 'OF-2024-003', 1000, 0, NULL, NULL, 'stopped');

-- ========================================
-- ÉTAPE 5: VÉRIFICATIONS FINALES
-- ========================================

-- Vérifier que toutes les tables ont des données
DO $$
DECLARE
    table_name TEXT;
    row_count INTEGER;
BEGIN
    FOR table_name IN 
        SELECT unnest(ARRAY[
            'stock_locations', 'tool_locations', 'material_types', 'tool_types',
            'machines', 'materials', 'tools', 'stock_products', 'productions'
        ])
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO row_count;
        RAISE NOTICE 'Table % contient % lignes', table_name, row_count;
        
        IF row_count = 0 THEN
            RAISE WARNING 'ATTENTION: La table % est vide!', table_name;
        END IF;
    END LOOP;
END $$;

-- Mettre à jour les timestamps
UPDATE materials SET updated_at = now();
UPDATE tools SET updated_at = now();
UPDATE stock_products SET updated_at = now();
UPDATE productions SET updated_at = now();

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '=== CONFIGURATION SUPABASE TERMINÉE ===';
    RAISE NOTICE 'RLS désactivé sur toutes les tables';
    RAISE NOTICE 'Données de test insérées';
    RAISE NOTICE 'Index créés pour les performances';
    RAISE NOTICE 'Application prête pour la production!';
END $$;