import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('User ID is required')
    }

    // Generate insights based on user data
    const insights = await generateInsights(user_id, supabaseClient)

    // Save insights to database
    for (const insight of insights) {
      await supabaseClient
        .from('insights')
        .insert({
          user_id,
          ...insight
        })
    }

    return new Response(
      JSON.stringify({ success: true, insights_generated: insights.length }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function generateInsights(userId: string, supabaseClient: any) {
  const insights = []

  // Get user data
  const [leadsRes, tasksRes, transactionsRes, conversationsRes] = await Promise.all([
    supabaseClient.from('leads').select('*').eq('user_id', userId),
    supabaseClient.from('tasks').select('*').eq('user_id', userId),
    supabaseClient.from('transactions').select('*').eq('user_id', userId),
    supabaseClient.from('conversations').select('*').eq('user_id', userId)
  ])

  const leads = leadsRes.data || []
  const tasks = tasksRes.data || []
  const transactions = transactionsRes.data || []
  const conversations = conversationsRes.data || []

  // Insight 1: Lead conversion analysis
  if (leads.length > 0) {
    const whatsappLeads = leads.filter(lead => lead.source === 'whatsapp')
    const emailLeads = leads.filter(lead => lead.source === 'email')
    const whatsappConversions = whatsappLeads.filter(lead => lead.status === 'won').length
    const emailConversions = emailLeads.filter(lead => lead.status === 'won').length

    if (whatsappLeads.length > 0 && emailLeads.length > 0) {
      const whatsappRate = (whatsappConversions / whatsappLeads.length) * 100
      const emailRate = (emailConversions / emailLeads.length) * 100

      if (whatsappRate > emailRate + 10) {
        insights.push({
          type: 'conversion_rate',
          title: 'WhatsApp tem melhor conversão',
          description: `Seus leads do WhatsApp têm ${Math.round(whatsappRate - emailRate)}% mais conversão que email`,
          priority: 2,
          data: { whatsapp_rate: whatsappRate, email_rate: emailRate }
        })
      }
    }
  }

  // Insight 2: Inactive leads detection
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const inactiveLeads = leads.filter(lead => 
    lead.last_contact && 
    new Date(lead.last_contact) < thirtyDaysAgo &&
    lead.status !== 'won' &&
    lead.status !== 'lost'
  )

  if (inactiveLeads.length > 0) {
    insights.push({
      type: 'inactive_leads',
      title: 'Clientes sem contato há muito tempo',
      description: `${inactiveLeads.length} clientes não interagem há mais de 30 dias`,
      priority: 3,
      data: { count: inactiveLeads.length, lead_ids: inactiveLeads.map(l => l.id) }
    })
  }

  // Insight 3: Task completion analysis
  if (tasks.length > 0) {
    const overdueTasks = tasks.filter(task => 
      task.due_date && 
      new Date(task.due_date) < new Date() && 
      task.status !== 'done'
    )

    if (overdueTasks.length > 0) {
      insights.push({
        type: 'overdue_tasks',
        title: 'Tarefas em atraso',
        description: `Você tem ${overdueTasks.length} tarefas em atraso que precisam de atenção`,
        priority: 2,
        data: { count: overdueTasks.length, task_ids: overdueTasks.map(t => t.id) }
      })
    }
  }

  // Insight 4: Financial opportunity analysis
  if (transactions.length > 0) {
    const currentMonth = new Date().getMonth()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    
    const currentMonthIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === currentMonth)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const lastMonthIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date).getMonth() === lastMonth)
      .reduce((sum, t) => sum + t.amount, 0)

    if (lastMonthIncome > 0) {
      const growthRate = ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
      
      if (growthRate > 20) {
        insights.push({
          type: 'revenue_growth',
          title: 'Crescimento acelerado',
          description: `Sua receita cresceu ${Math.round(growthRate)}% este mês. Considere aumentar preços`,
          priority: 2,
          data: { growth_rate: growthRate, current_income: currentMonthIncome, last_income: lastMonthIncome }
        })
      }
    }
  }

  // Insight 5: Communication pattern analysis
  if (conversations.length > 0) {
    const whatsappConversations = conversations.filter(c => c.channel === 'whatsapp').length
    const emailConversations = conversations.filter(c => c.channel === 'email').length
    const totalConversations = conversations.length

    if (whatsappConversations > emailConversations * 2) {
      insights.push({
        type: 'communication_pattern',
        title: 'WhatsApp é seu canal principal',
        description: `${Math.round((whatsappConversations / totalConversations) * 100)}% das suas conversas são no WhatsApp`,
        priority: 1,
        data: { whatsapp_percentage: (whatsappConversations / totalConversations) * 100 }
      })
    }
  }

  return insights
}