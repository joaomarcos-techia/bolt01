import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getProductByPriceId } from '../stripe-config';

export interface Subscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setSubscription(null);
        setLoading(false);
        return;
      }

      // First, do a simple health check to see if we can connect to Supabase
      try {
        const { error: healthError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (healthError) {
          console.warn('Database connection issue:', healthError.message);
          // Don't throw here, just log and continue with graceful fallback
          setSubscription(null);
          setLoading(false);
          return;
        }
      } catch (healthErr) {
        console.warn('Health check failed:', healthErr);
        setSubscription(null);
        setLoading(false);
        return;
      }

      // Check if Stripe tables exist by trying to query them
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle();

        if (customerError) {
          if (customerError.message?.includes('does not exist') || 
              customerError.message?.includes('relation') ||
              customerError.code === 'PGRST116') {
            console.warn('Stripe tables do not exist. User may not have applied migrations.');
            setSubscription(null);
            setLoading(false);
            return;
          }
          throw customerError;
        }

        if (!customerData?.customer_id) {
          // User doesn't have a Stripe customer record, which is normal for new users
          setSubscription(null);
          setLoading(false);
          return;
        }

        // Try to fetch subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select(`
            customer_id,
            subscription_id,
            status,
            price_id,
            current_period_start,
            current_period_end,
            cancel_at_period_end,
            payment_method_brand,
            payment_method_last4
          `)
          .eq('customer_id', customerData.customer_id)
          .is('deleted_at', null)
          .maybeSingle();

        if (subscriptionError) {
          if (subscriptionError.message?.includes('does not exist') || 
              subscriptionError.message?.includes('relation') ||
              subscriptionError.code === 'PGRST116') {
            console.warn('Stripe subscriptions table does not exist.');
            setSubscription(null);
            setLoading(false);
            return;
          }
          throw subscriptionError;
        }

        if (subscriptionData) {
          const mappedSubscription: Subscription = {
            customer_id: subscriptionData.customer_id,
            subscription_id: subscriptionData.subscription_id,
            subscription_status: subscriptionData.status,
            price_id: subscriptionData.price_id,
            current_period_start: subscriptionData.current_period_start,
            current_period_end: subscriptionData.current_period_end,
            cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
            payment_method_brand: subscriptionData.payment_method_brand,
            payment_method_last4: subscriptionData.payment_method_last4,
          };
          setSubscription(mappedSubscription);
        } else {
          setSubscription(null);
        }

      } catch (stripeErr) {
        console.warn('Error querying Stripe tables:', stripeErr);
        setSubscription(null);
        setLoading(false);
        return;
      }

    } catch (err) {
      console.error('Error fetching subscription:', err);
      
      // Don't set error state for common issues that should be handled gracefully
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || 
            err.message.includes('NetworkError') || 
            err.message.includes('fetch') ||
            err.message.includes('does not exist') ||
            err.message.includes('relation')) {
          console.warn('Subscription fetch failed gracefully:', err.message);
          setSubscription(null);
          setLoading(false);
          return;
        }
      }
      
      // Only set error for unexpected issues
      setError('Unable to load subscription data');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const createCheckoutSession = async (priceId: string, trialDays: number = 7) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/#precos`,
          mode: 'subscription',
          trial_period_days: trialDays
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Error creating checkout session:', err);
      throw err;
    }
  };

  const cancelSubscription = async () => {
    try {
      if (!user || !subscription?.subscription_id) {
        throw new Error('No active subscription found');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.subscription_id,
          cancel_at_period_end: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel subscription');
      }

      // Refresh subscription data
      await fetchSubscription();
      
      return { success: true };
    } catch (err) {
      console.error('Error canceling subscription:', err);
      throw err;
    }
  };

  const reactivateSubscription = async () => {
    try {
      if (!user || !subscription?.subscription_id) {
        throw new Error('No subscription found');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-reactivate-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.subscription_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reactivate subscription');
      }

      // Refresh subscription data
      await fetchSubscription();
      
      return { success: true };
    } catch (err) {
      console.error('Error reactivating subscription:', err);
      throw err;
    }
  };

  const deleteSubscription = async () => {
    try {
      if (!user || !subscription?.subscription_id) {
        throw new Error('No active subscription found');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-delete-subscription`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscription.subscription_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete subscription');
      }

      // Clear subscription data
      setSubscription(null);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting subscription:', err);
      throw err;
    }
  };

  const getActivePlan = () => {
    if (!subscription || !subscription.price_id) {
      return null;
    }

    return getProductByPriceId(subscription.price_id);
  };

  const isActive = () => {
    return subscription?.subscription_status === 'active' || subscription?.subscription_status === 'trialing';
  };

  const isTrialing = () => {
    return subscription?.subscription_status === 'trialing';
  };

  const isPastDue = () => {
    return subscription?.subscription_status === 'past_due';
  };

  const isCanceled = () => {
    return subscription?.subscription_status === 'canceled';
  };

  const getTrialDaysRemaining = () => {
    if (!isTrialing() || !subscription?.current_period_end) {
      return 0;
    }

    const trialEndDate = new Date(subscription.current_period_end * 1000);
    const now = new Date();
    const diffTime = trialEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  return {
    subscription,
    loading,
    error,
    createCheckoutSession,
    cancelSubscription,
    reactivateSubscription,
    deleteSubscription,
    getActivePlan,
    isActive,
    isTrialing,
    isPastDue,
    isCanceled,
    getTrialDaysRemaining,
    refetch: fetchSubscription
  };
}