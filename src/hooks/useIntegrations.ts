import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface Integration {
  id: string
  user_id: string
  service: string
  config: {
    apiKey?: string
    webhookUrl?: string
    phoneNumber?: string
    smtpHost?: string
    smtpPort?: string
    username?: string
    password?: string
    model?: string
    systemPrompt?: string
  }
  is_active: boolean
  last_sync: string | null
  created_at: string
  updated_at: string
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchIntegrations()
    }
  }, [user])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setIntegrations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching integrations')
    } finally {
      setLoading(false)
    }
  }

  const saveIntegration = async (service: string, config: any) => {
    try {
      const existingIntegration = integrations.find(i => i.service === service)
      
      if (existingIntegration) {
        const { data, error } = await supabase
          .from('integrations')
          .update({ 
            config,
            is_active: true,
            last_sync: new Date().toISOString()
          })
          .eq('id', existingIntegration.id)
          .select()
          .single()

        if (error) throw error
        setIntegrations(prev => prev.map(i => i.id === existingIntegration.id ? data : i))
      } else {
        const { data, error } = await supabase
          .from('integrations')
          .insert([{
            user_id: user!.id,
            service,
            config,
            is_active: true
          }])
          .select()
          .single()

        if (error) throw error
        setIntegrations(prev => [data, ...prev])
      }

      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error saving integration'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  const testIntegration = async (service: string) => {
    try {
      const integration = integrations.find(i => i.service === service)
      if (!integration) {
        throw new Error('Integration not found')
      }

      // Call edge function to test integration
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-integration`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service,
          config: integration.config
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Test failed')
      }

      return { success: true, result }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Test failed'
      return { success: false, error: errorMessage }
    }
  }

  const getIntegrationByService = (service: string) => {
    return integrations.find(i => i.service === service)
  }

  return {
    integrations,
    loading,
    error,
    saveIntegration,
    testIntegration,
    getIntegrationByService,
    refetch: fetchIntegrations
  }
}