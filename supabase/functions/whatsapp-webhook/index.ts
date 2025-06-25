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

    if (req.method === 'GET') {
      // WhatsApp webhook verification
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      if (mode === 'subscribe' && token === 'coreflow_webhook_token') {
        return new Response(challenge, { status: 200 })
      } else {
        return new Response('Forbidden', { status: 403 })
      }
    }

    if (req.method === 'POST') {
      const body = await req.json()
      
      // Process WhatsApp webhook
      if (body.entry && body.entry[0] && body.entry[0].changes) {
        const changes = body.entry[0].changes[0]
        
        if (changes.field === 'messages' && changes.value.messages) {
          const message = changes.value.messages[0]
          const contact = changes.value.contacts[0]
          
          // Find or create lead
          const phoneNumber = contact.wa_id
          const { data: existingLead } = await supabaseClient
            .from('leads')
            .select('*')
            .eq('whatsapp', phoneNumber)
            .single()

          let leadId = existingLead?.id

          if (!existingLead) {
            // Create new lead
            const { data: newLead } = await supabaseClient
              .from('leads')
              .insert({
                name: contact.profile?.name || `Lead ${phoneNumber}`,
                whatsapp: phoneNumber,
                source: 'whatsapp',
                status: 'new'
              })
              .select()
              .single()

            leadId = newLead?.id
          }

          // Save conversation
          if (leadId) {
            await supabaseClient
              .from('conversations')
              .insert({
                lead_id: leadId,
                user_id: existingLead?.user_id,
                channel: 'whatsapp',
                message: message.text?.body || 'Mensagem de mídia',
                is_from_lead: true,
                is_automated: false
              })

            // Trigger automation
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/automation-engine`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                trigger: {
                  type: 'new_whatsapp_message',
                  data: {
                    lead_id: leadId,
                    user_id: existingLead?.user_id,
                    message: message.text?.body,
                    phone_number: phoneNumber
                  }
                }
              })
            })
          }
        }
      }

      return new Response('OK', { status: 200 })
    }

    return new Response('Method not allowed', { status: 405 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})