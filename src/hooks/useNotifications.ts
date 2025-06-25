import { useState, useEffect } from 'react'
import { supabase, Notification } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            setNotifications(prev => [payload.new as Notification, ...prev])
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? data : notification
      ))
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error marking notification as read'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false)

      if (error) throw error
      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })))
      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error marking all notifications as read'
      setError(errorMessage)
      return { error: errorMessage }
    }
  }

  const getNotificationStats = () => {
    const total = notifications.length
    const unread = notifications.filter(n => !n.is_read).length

    return {
      total,
      unread
    }
  }

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
    stats: getNotificationStats()
  }
}