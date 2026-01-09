import { createClient } from '@supabase/supabase-js';

// Supabase Client Initialisierung (Service Role Key umgeht RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Hilfsfunktion: Wir exportieren ein leeres initDb für deine Skripte
export const initDb = async () => {
  console.log('Supabase Datenbank-Modus aktiv.');
};

// --- ERSATZ FÜR DEINE GENERIC CRUD OPERATIONS ---

export async function getAll<T>(storeName: string): Promise<T[]> {
  console.log(`getAll: querying ${storeName}`);
  const { data, error } = await supabase.from(storeName).select('*');
  console.log(`getAll: ${storeName} returned ${data?.length ?? 0} items, error:`, error);
  if (error) throw error;
  return data as T[];
}

export async function getById<T extends { id: number }>(storeName: string, id: number): Promise<T | undefined> {
  const { data, error } = await supabase.from(storeName).select('*').eq('id', id).single();
  if (error) return undefined;
  return data as T;
}

export async function create<T extends { id?: number }>(storeName: string, item: Omit<T, 'id'> & { user_id: string }): Promise<T> {
  const { data, error } = await supabase.from(storeName).insert([item]).select();
  if (error) throw error;
  return data[0] as T;
}

export async function update<T extends { id: number }>(storeName: string, id: number, updates: Partial<T>, userId?: string): Promise<T | undefined> {
  let query = supabase.from(storeName).update(updates).eq('id', id);
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { data, error } = await query.select();
  if (error) throw error;
  return data[0] as T;
}

export async function remove(storeName: string, id: number, userId?: string): Promise<boolean> {
  let query = supabase.from(storeName).delete().eq('id', id);
  if (userId) {
    query = query.eq('user_id', userId);
  }
  const { error } = await query;
  return !error;
}

export async function clearDone(storeName: string, userId?: string): Promise<boolean> {
    let query = supabase.from(storeName).delete().eq('done', true);
    if (userId) {
        query = query.eq('user_id', userId);
    }
    const { error } = await query;
    return !error;
}

export async function query<T>(tableName: string, options: {
    where?: Record<string, any>;
    select?: string;
    orderBy?: { column: string; ascending: boolean };
}): Promise<T[]> {
    let query = supabase.from(tableName).select(options.select || '*');

    if (options.where) {
        query = query.match(options.where);
    }

    if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
    }

    const { data, error } = await query;

    if (error) {
        console.error(`Error querying ${tableName}:`, error);
        throw new Error(`Failed to query ${tableName}`);
    }

    return data as T[];
}

// Hilfsfunktionen (behalten wir bei, da sie keine Dateien brauchen)
export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getWeek(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}