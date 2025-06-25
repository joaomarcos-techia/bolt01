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

    const { leadId, message, userId } = await req.json()

    // Get user's OpenAI integration
    const { data: openaiIntegration } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service', 'openai')
      .eq('is_active', true)
      .single()

    if (!openaiIntegration) {
      throw new Error('OpenAI integration not configured')
    }

    // Get lead information for context
    const { data: lead } = await supabaseClient
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    // Get conversation history
    const { data: conversations } = await supabaseClient
      .from('conversations')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: true })
      .limit(10)

    // Build conversation context
    const conversationHistory = conversations?.map(conv => ({
      role: conv.is_from_lead ? 'user' : 'assistant',
      content: conv.message
    })) || []

    // Generate AI response
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiIntegration.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: openaiIntegration.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `${openaiIntegration.config.systemPrompt}
            
            Informações do lead:
            - Nome: ${lead?.name}
            - Empresa: ${lead?.company || 'Não informado'}
            - Status: ${lead?.status}
            - Valor potencial: ${lead?.value ? `R$ ${lead.value}` : 'Não informado'}
            
            Responda de forma natural e profissional. Mantenha as respostas concisas e focadas em ajudar o cliente.`
          },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message}`)
    }

    const aiResponse = await response.json()
    const aiMessage = aiResponse.choices[0]?.message?.content

    if (!aiMessage) {
      throw new Error('No response from AI')
    }

    // Save AI response to conversations
    await supabaseClient
      .from('conversations')
      .insert({
        lead_id: leadId,
        user_id: userId,
        channel: 'whatsapp',
        message: aiMessage,
        is_from_lead: false,
        is_automated: true
      })

    // Send WhatsApp message (if integration is configured)
    const { data: whatsappIntegration } = await supabaseClient
      .from('integrations')
      .select('*')
      .eq('user_id', userId)
      .eq('service', 'whatsapp')
      .eq('is_active', true)
      .single()

    if (whatsappIntegration && lead?.whatsapp) {
      await sendWhatsAppMessage(
        whatsappIntegration.config.apiKey,
        whatsappIntegration.config.phoneNumber,
        lead.whatsapp,
        aiMessage
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: aiMessage,
        sent_via_whatsapp: !!whatsappIntegration
      }),
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

async function sendWhatsAppMessage(apiKey: string, fromPhoneNumber: string, toPhoneNumber: string, message: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${fromPhoneNumber}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhoneNumber,
        type: 'text',
        text: { body: message }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('WhatsApp send error:', error)
      throw new Error(`Failed to send WhatsApp message: ${error.error?.message}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    throw error
  }
}