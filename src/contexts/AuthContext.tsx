import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, options?: { fullName?: string; profilePhoto?: File | null }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  getUserDisplayName: () => string
  getUserPhotoUrl: () => string | null
  hasActiveSubscription: () => boolean
  subscriptionLoading: boolean
  isFreeUser: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Lista de usuários com acesso gratuito completo
const FREE_ACCESS_EMAILS = [
  'joaogestor.ia@gmail.com'
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [subscriptionLoading, setSubscriptionLoading] = useState(true)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Check subscription status when user changes
  useEffect(() => {
    if (user) {
      checkSubscriptionStatus()
    } else {
      setHasSubscription(false)
      setSubscriptionLoading(false)
    }
  }, [user])

  const isFreeUser = () => {
    if (!user?.email) return false
    return FREE_ACCESS_EMAILS.includes(user.email.toLowerCase())
  }

  const checkSubscriptionStatus = async () => {
    try {
      setSubscriptionLoading(true)
      
      // Se é usuário com acesso gratuito, não precisa verificar assinatura
      if (isFreeUser()) {
        setHasSubscription(true)
        setSubscriptionLoading(false)
        return
      }
      
      // Test basic Supabase connectivity first
      const { error: connectivityError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (connectivityError) {
        console.error('Supabase connectivity test failed:', connectivityError)
        setHasSubscription(false)
        return
      }

      // Try multiple approaches to check subscription status
      let subscriptionStatus = null

      // Approach 1: Try the view first
      try {
        const { data: viewData, error: viewError } = await supabase
          .from('stripe_user_subscriptions')
          .select('subscription_status')
          .maybeSingle()

        if (!viewError && viewData) {
          subscriptionStatus = viewData.subscription_status
        } else if (viewError) {
          console.warn('View query failed:', viewError.message)
        }
      } catch (viewErr) {
        console.warn('View query exception:', viewErr)
      }

      // Approach 2: If view failed, try direct table query
      if (!subscriptionStatus) {
        try {
          // First get the customer ID
          const { data: customerData, error: customerError } = await supabase
            .from('stripe_customers')
            .select('customer_id')
            .eq('user_id', user!.id)
            .is('deleted_at', null)
            .maybeSingle()

          if (!customerError && customerData?.customer_id) {
            // Then get subscription status
            const { data: subscriptionData, error: subscriptionError } = await supabase
              .from('stripe_subscriptions')
              .select('status')
              .eq('customer_id', customerData.customer_id)
              .is('deleted_at', null)
              .maybeSingle()

            if (!subscriptionError && subscriptionData) {
              subscriptionStatus = subscriptionData.status
            }
          }
        } catch (directErr) {
          console.warn('Direct table query exception:', directErr)
        }
      }

      // Approach 3: If both failed, check if tables exist at all
      if (!subscriptionStatus) {
        try {
          // Try to query stripe_customers table to see if it exists
          const { error: tableError } = await supabase
            .from('stripe_customers')
            .select('id')
            .limit(1)

          if (tableError && tableError.message?.includes('does not exist')) {
            console.warn('Stripe tables do not exist yet. User needs to apply migrations.')
            setHasSubscription(false)
            return
          }
        } catch (tableErr) {
          console.warn('Table existence check failed:', tableErr)
        }
      }

      // Determine if subscription is active
      if (subscriptionStatus) {
        const activeStatuses = ['active', 'trialing']
        setHasSubscription(activeStatuses.includes(subscriptionStatus))
      } else {
        // No subscription found
        setHasSubscription(false)
      }

    } catch (error) {
      console.error('Unexpected error checking subscription:', error)
      // On any unexpected error, default to no subscription
      setHasSubscription(false)
    } finally {
      setSubscriptionLoading(false)
    }
  }

  const uploadProfilePhoto = async (file: File, userId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `profile-photos/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading profile photo:', error)
      return null
    }
  }

  const signUp = async (email: string, password: string, options?: { fullName?: string; profilePhoto?: File | null }) => {
    try {
      let photoUrl: string | null = null

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: options?.fullName || '',
          }
        }
      })

      if (error) return { error }

      // Upload profile photo if provided and user was created
      if (options?.profilePhoto && data.user) {
        photoUrl = await uploadProfilePhoto(options.profilePhoto, data.user.id)
        
        // Update user metadata with photo URL
        if (photoUrl) {
          await supabase.auth.updateUser({
            data: {
              full_name: options.fullName || '',
              avatar_url: photoUrl
            }
          })
        }
      }

      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setHasSubscription(false)
  }

  const getUserDisplayName = () => {
    if (!user) return 'Usuário'
    
    // Try to get name from user metadata first
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    
    // Extract name from email (part before @)
    if (user.email) {
      const emailName = user.email.split('@')[0]
      
      // Capitalize first letter and replace dots/underscores with spaces
      const displayName = emailName
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      return displayName
    }
    
    return 'Usuário'
  }

  const getUserPhotoUrl = () => {
    if (!user) return null
    
    // Debug: Log user metadata to see what's available
    console.log('User metadata:', user.user_metadata)
    
    // Try to get photo from user metadata
    if (user.user_metadata?.avatar_url) {
      const avatarUrl = user.user_metadata.avatar_url
      console.log('Found avatar URL:', avatarUrl)
      
      // Return the URL as is - let the browser handle loading
      return avatarUrl
    }
    
    console.log('No avatar URL found in user metadata')
    return null
  }

  const hasActiveSubscription = () => {
    // Usuários com acesso gratuito sempre têm "assinatura ativa"
    if (isFreeUser()) {
      return true
    }
    
    return hasSubscription
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getUserDisplayName,
    getUserPhotoUrl,
    hasActiveSubscription,
    subscriptionLoading,
    isFreeUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}