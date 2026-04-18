/**
 * Supabase Integration Scaffolding
 *
 * This module provides the architecture for connecting BizInsight to Supabase.
 * Currently uses localStorage (via storage.js). When ready, flip USE_SUPABASE
 * to true and add your project credentials.
 *
 * Setup Instructions:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Create the following tables:
 *
 *    -- Portfolio holdings
 *    CREATE TABLE portfolio_holdings (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      user_id UUID REFERENCES auth.users(id),
 *      coin_id TEXT NOT NULL,
 *      name TEXT NOT NULL,
 *      symbol TEXT NOT NULL,
 *      amount DECIMAL NOT NULL,
 *      buy_price DECIMAL NOT NULL,
 *      created_at TIMESTAMPTZ DEFAULT now()
 *    );
 *
 *    -- Custom KPIs
 *    CREATE TABLE custom_kpis (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      user_id UUID REFERENCES auth.users(id),
 *      title TEXT NOT NULL,
 *      value TEXT NOT NULL,
 *      trend TEXT,
 *      is_positive BOOLEAN DEFAULT true,
 *      created_at TIMESTAMPTZ DEFAULT now()
 *    );
 *
 *    -- Custom products
 *    CREATE TABLE custom_products (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      user_id UUID REFERENCES auth.users(id),
 *      title TEXT NOT NULL,
 *      category TEXT DEFAULT 'Custom',
 *      price DECIMAL NOT NULL,
 *      description TEXT,
 *      image_url TEXT,
 *      created_at TIMESTAMPTZ DEFAULT now()
 *    );
 *
 *    -- Price alerts
 *    CREATE TABLE price_alerts (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      user_id UUID REFERENCES auth.users(id),
 *      coin_id TEXT NOT NULL,
 *      symbol TEXT NOT NULL,
 *      target_price DECIMAL NOT NULL,
 *      direction TEXT CHECK (direction IN ('above', 'below')),
 *      triggered BOOLEAN DEFAULT false,
 *      created_at TIMESTAMPTZ DEFAULT now()
 *    );
 *
 *    -- User settings
 *    CREATE TABLE user_settings (
 *      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *      user_id UUID REFERENCES auth.users(id) UNIQUE,
 *      theme TEXT DEFAULT 'beige',
 *      dashboard_widgets JSONB,
 *      email_reports BOOLEAN DEFAULT false,
 *      report_frequency TEXT DEFAULT 'weekly',
 *      updated_at TIMESTAMPTZ DEFAULT now()
 *    );
 *
 * 3. Enable Row Level Security (RLS) on all tables
 * 4. Add policies: user can only read/write their own rows
 *
 *    CREATE POLICY "Users can manage own data" ON portfolio_holdings
 *      FOR ALL USING (auth.uid() = user_id);
 *    -- Repeat for other tables
 */

const USE_SUPABASE = false;

// Placeholder — replace with your project URL and anon key
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key-here";

let supabase = null;

async function getClient() {
  if (!USE_SUPABASE) return null;
  if (!supabase) {
    const { createClient } = await import("@supabase/supabase-js");
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

// ──────────── Portfolio ────────────
export const portfolioService = {
  async getAll(userId) {
    const client = await getClient();
    if (!client) return null; // Fall back to localStorage
    const { data, error } = await client
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },

  async add(userId, holding) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client
      .from("portfolio_holdings")
      .insert({ user_id: userId, ...holding })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId, id) {
    const client = await getClient();
    if (!client) return null;
    const { error } = await client
      .from("portfolio_holdings")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  },
};

// ──────────── Custom KPIs ────────────
export const kpiService = {
  async getAll(userId) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client
      .from("custom_kpis")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");
    if (error) throw error;
    return data;
  },

  async upsert(userId, kpi) {
    const client = await getClient();
    if (!client) return null;
    const { data, error } = await client
      .from("custom_kpis")
      .upsert({ user_id: userId, ...kpi })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async remove(userId, id) {
    const client = await getClient();
    if (!client) return null;
    const { error } = await client
      .from("custom_kpis")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  },
};

// ──────────── Settings ────────────
export const settingsService = {
  async get(userId) {
    const client = await getClient();
    if (!client) return null;
    const { data } = await client
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();
    return data;
  },

  async update(userId, settings) {
    const client = await getClient();
    if (!client) return null;
    const { error } = await client
      .from("user_settings")
      .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() });
    if (error) throw error;
  },
};

export default { portfolioService, kpiService, settingsService, USE_SUPABASE };
