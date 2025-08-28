/*
  # Add subcontractor support to stock products

  1. Changes
    - Add `subcontractor_id` column to `stock_products` table
    - Add foreign key constraint to `subcontractors` table
    - Add index for better query performance

  2. Security
    - No RLS changes needed (inherits from existing table policies)
*/

-- Add subcontractor_id column to stock_products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_products' AND column_name = 'subcontractor_id'
  ) THEN
    ALTER TABLE stock_products ADD COLUMN subcontractor_id uuid;
  END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'stock_products_subcontractor_id_fkey'
  ) THEN
    ALTER TABLE stock_products 
    ADD CONSTRAINT stock_products_subcontractor_id_fkey 
    FOREIGN KEY (subcontractor_id) REFERENCES subcontractors(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for better query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_stock_products_subcontractor'
  ) THEN
    CREATE INDEX idx_stock_products_subcontractor ON stock_products(subcontractor_id);
  END IF;
END $$;