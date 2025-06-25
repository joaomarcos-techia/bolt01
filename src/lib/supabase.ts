import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  throw new Error('Missing or invalid VITE_SUPABASE_URL environment variable. Please update your .env file with your actual Supabase project URL.')
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_anon_key_here') {
  throw new Error('Missing or invalid VITE_SUPABASE_ANON_KEY environment variable. Please update your .env file with your actual Supabase anon key.')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export types for easier use
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific type exports
export type Lead = Tables<'leads'>
export type Task = Tables<'tasks'>
export type Transaction = Tables<'transactions'>
export type Automation = Tables<'automations'>
export type Insight = Tables<'insights'>
export type Notification = Tables<'notifications'>
export type Tag = Tables<'tags'>
export type Account = Tables<'accounts'>
export type Category = Tables<'categories'>