import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface StockLocation {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ToolLocation {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  created_at: string;
  updated_at: string;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface MaterialType {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Material {
  id: string;
  material_type_id: string;
  lot_number: string;
  diameter: number;
  cases_count: number;
  weight_kg: number;
  supplier: string;
  reception_date: string;
  alert_threshold: number;
  status: 'normal' | 'low' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface ToolType {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Tool {
  id: string;
  tool_type_id: string;
  tool_location_id: string;
  reference: string;
  description: string;
  quantity: number;
  alert_threshold: number;
  status: 'normal' | 'low' | 'critical';
  created_at: string;
  updated_at: string;
}

export interface ProductReference {
  id: string;
  reference: string;
  order_number: string;
  material_lot: string;
  machine_id: string;
  quantity: number;
  production_date: string;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface StockProduct {
  id: string;
  reference: string;
  description: string;
  stock_location_id: string;
  subcontractor_id?: string;
  quantity: number;
  unit: string;
  status: 'normal' | 'low' | 'critical';
  last_update: string;
  created_at: string;
  updated_at: string;
}

export interface Production {
  id: string;
  machine_id: string;
  cadence: number;
  material_type: string;
  material_lot: string;
  reference: string;
  order_number: string;
  quantity: number;
  produced: number;
  start_time: string | null;
  estimated_end: string | null;
  status: 'running' | 'paused' | 'stopped' | 'completed';
  created_at: string;
  updated_at: string;
}