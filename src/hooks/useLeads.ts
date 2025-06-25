import { useState, useEffect } from 'react'
import { supabase, Lead } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchLeads()
    }
  }, [user])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setLeads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching leads')
    } finally {
      setLoading(false)
    }
  }

  const createLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([{ ...leadData, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setLeads(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating lead'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating lead'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      setLeads(prev => prev.filter(lead => lead.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting lead'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const getLeadStats = () => {
    const total = leads.length
    const qualified = leads.filter(lead => lead.status === 'qualified').length
    const won = leads.filter(lead => lead.status === 'won').length
    const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0'
    const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0)

    return {
      total,
      qualified,
      won,
      conversionRate: `${conversionRate}%`,
      totalValue
    }
  }

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    refetch: fetchLeads,
    stats: getLeadStats()
  }
}