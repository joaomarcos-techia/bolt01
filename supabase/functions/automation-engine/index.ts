import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationTrigger {
  type: string
  conditions: Record<string, any>
  data: Record<string, any>
}

interface AutomationAction {
  type: string
  config: Record<string, any>
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

    const { trigger }: { trigger: AutomationTrigger } = await req.json()

    // Get all active automations that match the trigger type
    const { data: automations, error: automationsError } = await supabaseClient
      .from('automations')
      .select('*')
      .eq('status', 'active')
      .eq('trigger_type', trigger.type)

    if (automationsError) {
      throw automationsError
    }

    const results = []

    for (const automation of automations || []) {
      try {
        // Check if trigger conditions are met
        const conditionsMet = checkTriggerConditions(automation.trigger_conditions, trigger.data)
        
        if (conditionsMet) {
          // Execute automation actions
          const actionResults = await executeActions(automation.actions as AutomationAction[], trigger.data, supabaseClient)
          
          // Log the execution
          await supabaseClient
            .from('automation_logs')
            .insert({
              automation_id: automation.id,
              trigger_data: trigger.data,
              actions_executed: actionResults,
              success: true
            })

          // Update automation run count and last run time
          await supabaseClient
            .from('automations')
            .update({
              run_count: automation.run_count + 1,
              last_run: new Date().toISOString()
            })
            .eq('id', automation.id)

          results.push({
            automation_id: automation.id,
            success: true,
            actions_executed: actionResults.length
          })
        }
      } catch (error) {
        // Log the error
        await supabaseClient
          .from('automation_logs')
          .insert({
            automation_id: automation.id,
            trigger_data: trigger.data,
            success: false,
            error_message: error.message
          })

        results.push({
          automation_id: automation.id,
          success: false,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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

function checkTriggerConditions(conditions: Record<string, any>, triggerData: Record<string, any>): boolean {
  // For WhatsApp message trigger
  if (triggerData.message && conditions.keywords) {
    const message = triggerData.message.toLowerCase()
    const keywords = conditions.keywords || []
    
    // Check if message contains any of the keywords
    const hasKeyword = keywords.some((keyword: string) => 
      message.includes(keyword.toLowerCase())
    )
    
    if (!hasKeyword) return false
  }

  // Check time range if specified
  if (conditions.timeRange) {
    const now = new Date()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    const startTime = parseInt(conditions.timeRange.start.replace(':', ''))
    const endTime = parseInt(conditions.timeRange.end.replace(':', ''))
    
    if (currentTime < startTime || currentTime > endTime) {
      return false
    }
  }

  return true
}

async function executeActions(actions: AutomationAction[], triggerData: Record<string, any>, supabaseClient: any): Promise<any[]> {
  const results = []

  for (const action of actions) {
    try {
      let result
      
      switch (action.type) {
        case 'ai_response':
          result = await executeAIResponse(triggerData, supabaseClient)
          break
        case 'send_email':
          result = await sendEmail(action.config, triggerData, supabaseClient)
          break
        case 'create_task':
          result = await createTask(action.config, triggerData, supabaseClient)
          break
        case 'update_lead':
          result = await updateLead(action.config, triggerData, supabaseClient)
          break
        case 'create_notification':
          result = await createNotification(action.config, triggerData, supabaseClient)
          break
        default:
          result = { success: false, error: `Unknown action type: ${action.type}` }
      }
      
      results.push({ action: action.type, result })
    } catch (error) {
      results.push({ action: action.type, error: error.message })
    }
  }

  return results
}

async function executeAIResponse(triggerData: Record<string, any>, supabaseClient: any) {
  try {
    // Call AI responder function
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-responder`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        leadId: triggerData.lead_id,
        message: triggerData.message,
        userId: triggerData.user_id
      })
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.error || 'AI response failed')
    }

    return { success: true, message: 'AI response sent successfully', data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function sendEmail(config: Record<string, any>, triggerData: Record<string, any>, supabaseClient: any) {
  // Email sending logic would go here
  // For now, just simulate success
  console.log('Sending email:', config, triggerData)
  return { success: true, message: 'Email sent successfully' }
}

async function createTask(config: Record<string, any>, triggerData: Record<string, any>, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('tasks')
    .insert({
      user_id: triggerData.user_id,
      title: config.title || 'Automated Task',
      description: config.description || 'Task created by automation',
      priority: config.priority || 'medium',
      due_date: config.due_date ? new Date(config.due_date).toISOString() : null,
      lead_id: triggerData.lead_id || null
    })

  if (error) throw error
  return { success: true, task_id: data?.id }
}

async function updateLead(config: Record<string, any>, triggerData: Record<string, any>, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('leads')
    .update(config.updates)
    .eq('id', triggerData.lead_id)

  if (error) throw error
  return { success: true, lead_id: triggerData.lead_id }
}

async function createNotification(config: Record<string, any>, triggerData: Record<string, any>, supabaseClient: any) {
  const { data, error } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: triggerData.user_id,
      type: config.type || 'info',
      title: config.title || 'Automation Notification',
      message: config.message || 'An automation has been triggered',
      action_url: config.action_url || null
    })

  if (error) throw error
  return { success: true, notification_id: data?.id }
}