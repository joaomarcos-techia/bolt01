export type Json =
  | string
  | number
  | boolean
  | null
  | { [key]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          plan: string | null
          api_key_ia: string | null
        }
        Insert: {
          id: string
          plan?: string | null
          api_key_ia?: string | null
        }
        Update: {
          id?: string
          plan?: string | null
          api_key_ia?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          whatsapp: string | null
          company: string | null
          status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
          source: string | null
          value: number | null
          notes: string | null
          last_contact: string | null
          next_follow_up: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          company?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
          source?: string | null
          value?: number | null
          notes?: string | null
          last_contact?: string | null
          next_follow_up?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          whatsapp?: string | null
          company?: string | null
          status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
          source?: string | null
          value?: number | null
          notes?: string | null
          last_contact?: string | null
          next_follow_up?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          lead_id: string
          user_id: string
          channel: string
          message: string
          is_from_lead: boolean
          is_automated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          user_id: string
          channel?: string
          message: string
          is_from_lead?: boolean
          is_automated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          user_id?: string
          channel?: string
          message?: string
          is_from_lead?: boolean
          is_automated?: boolean
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          category?: string
          created_at?: string
        }
      }
      lead_tags: {
        Row: {
          lead_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          lead_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          lead_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'review' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          due_date: string | null
          completed_at: string | null
          lead_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          lead_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          due_date?: string | null
          completed_at?: string | null
          lead_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_assignments: {
        Row: {
          task_id: string
          user_id: string
          assigned_at: string
        }
        Insert: {
          task_id: string
          user_id: string
          assigned_at?: string
        }
        Update: {
          task_id?: string
          user_id?: string
          assigned_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type?: string
          balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          balance?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'income' | 'expense'
          color?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'income' | 'expense'
          color?: string
          is_default?: boolean
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          category_id: string | null
          type: 'income' | 'expense'
          amount: number
          description: string
          date: string
          is_recurring: boolean
          recurring_interval: string | null
          lead_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          category_id?: string | null
          type: 'income' | 'expense'
          amount: number
          description: string
          date?: string
          is_recurring?: boolean
          recurring_interval?: string | null
          lead_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          category_id?: string | null
          type?: 'income' | 'expense'
          amount?: number
          description?: string
          date?: string
          is_recurring?: boolean
          recurring_interval?: string | null
          lead_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      automations: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          trigger_type: string
          trigger_conditions: Json
          actions: Json
          status: 'active' | 'paused' | 'draft'
          last_run: string | null
          run_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          trigger_type: string
          trigger_conditions?: Json
          actions?: Json
          status?: 'active' | 'paused' | 'draft'
          last_run?: string | null
          run_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          trigger_type?: string
          trigger_conditions?: Json
          actions?: Json
          status?: 'active' | 'paused' | 'draft'
          last_run?: string | null
          run_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      automation_logs: {
        Row: {
          id: string
          automation_id: string
          trigger_data: Json | null
          actions_executed: Json | null
          success: boolean
          error_message: string | null
          executed_at: string
        }
        Insert: {
          id?: string
          automation_id: string
          trigger_data?: Json | null
          actions_executed?: Json | null
          success?: boolean
          error_message?: string | null
          executed_at?: string
        }
        Update: {
          id?: string
          automation_id?: string
          trigger_data?: Json | null
          actions_executed?: Json | null
          success?: boolean
          error_message?: string | null
          executed_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          description: string
          data: Json
          priority: number
          is_read: boolean
          is_applied: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          description: string
          data?: Json
          priority?: number
          is_read?: boolean
          is_applied?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          description?: string
          data?: Json
          priority?: number
          is_read?: boolean
          is_applied?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'info' | 'warning' | 'error' | 'success'
          title: string
          message: string
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type?: 'info' | 'warning' | 'error' | 'success'
          title: string
          message: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'info' | 'warning' | 'error' | 'success'
          title?: string
          message?: string
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          user_id: string
          service: string
          config: Json
          is_active: boolean
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service: string
          config?: Json
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          service?: string
          config?: Json
          is_active?: boolean
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}