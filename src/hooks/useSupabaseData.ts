import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabaseData<T>(
  tableName: string,
  selectQuery: string = '*',
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: fetchError } = await supabase
        .from(tableName)
        .select(selectQuery)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setData(result || []);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      // En cas d'erreur, on retourne des données vides plutôt que de bloquer
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}

export function useSupabaseInsert<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const insert = async (data: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: insertError } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      return result;
    } catch (err) {
      console.error(`Error inserting into ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { insert, loading, error };
}

export function useSupabaseUpdate<T>(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, data: Partial<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      return result;
    } catch (err) {
      console.error(`Error updating ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

export function useSupabaseDelete(tableName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      return true;
    } catch (err) {
      console.error(`Error deleting from ${tableName}:`, err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteItem, loading, error };
}