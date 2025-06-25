import { useState, useEffect } from 'react'
import { supabase, Transaction, Account, Category } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch transactions, accounts, and categories in parallel
      const [transactionsRes, accountsRes, categoriesRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .order('date', { ascending: false }),
        supabase
          .from('accounts')
          .select('*')
          .eq('is_active', true),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ])

      if (transactionsRes.error) throw transactionsRes.error
      if (accountsRes.error) throw accountsRes.error
      if (categoriesRes.error) throw categoriesRes.error

      setTransactions(transactionsRes.data || [])
      setAccounts(accountsRes.data || [])
      setCategories(categoriesRes.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching financial data')
    } finally {
      setLoading(false)
    }
  }

  const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transactionData, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setTransactions(prev => [data, ...prev])
      
      // Update account balance
      await updateAccountBalance(transactionData.account_id)
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error creating transaction'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  const updateAccountBalance = async (accountId: string) => {
    try {
      // Calculate new balance based on all transactions for this account
      const { data: accountTransactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .eq('account_id', accountId)

      if (accountTransactions) {
        const balance = accountTransactions.reduce((sum, transaction) => {
          return transaction.type === 'income' 
            ? sum + transaction.amount 
            : sum - transaction.amount
        }, 0)

        await supabase
          .from('accounts')
          .update({ balance })
          .eq('id', accountId)

        // Update local state
        setAccounts(prev => prev.map(account => 
          account.id === accountId ? { ...account, balance } : account
        ))
      }
    } catch (err) {
      console.error('Error updating account balance:', err)
    }
  }

  const getFinancialStats = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear
    })

    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = income - expenses
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    return {
      monthlyIncome: income,
      monthlyExpenses: expenses,
      monthlyBalance: balance,
      totalBalance,
      transactionCount: currentMonthTransactions.length
    }
  }

  return {
    transactions,
    accounts,
    categories,
    loading,
    error,
    createTransaction,
    refetch: fetchData,
    stats: getFinancialStats()
  }
}