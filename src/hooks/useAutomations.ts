import { useState, useEffect } from 'react'
import { supabase, Automation } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAutomations()
    }
  }, [user])

  const fetchAutomations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAutomations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching automations')
    } finally {
      setLoading(false)
    }
  }

  const createAutomation = async (automationData: Omit<Automation, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'last_run' | 'run_count'>) => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .insert([{ ...automationData, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setAutomations(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating automation'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateAutomation = async (id: string, updates: Partial<Automation>) => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setAutomations(prev => prev.map(automation => automation.id === id ? data : automation))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error updating automation'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const toggleAutomation = async (id: string) => {
    const automation = automations.find(a => a.id === id)
    if (!automation) return

    const newStatus = automation.status === 'active' ? 'paused' : 'active'
    return updateAutomation(id, { status: newStatus })
  }

  const deleteAutomation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('automations')
        .delete()
        .eq('id', id)

      if (error) throw error
      setAutomations(prev => prev.filter(automation => automation.id !== id))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting automation'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const getAutomationStats = () => {
    const total = automations.length
    const active = automations.filter(a => a.status === 'active').length
    const totalRuns = automations.reduce((sum, a) => sum + a.run_count, 0)

    return {
      total,
      active,
      paused: total - active,
      totalRuns
    }
  }

  return {
    automations,
    loading,
    error,
    createAutomation,
    updateAutomation,
    toggleAutomation,
    deleteAutomation,
    refetch: fetchAutomations,
    stats: getAutomationStats()
  }
}