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
    const { service, config } = await req.json()

    let testResult = { success: false, message: '' }

    switch (service) {
      case 'whatsapp':
        testResult = await testWhatsApp(config)
        break
      case 'email':
        testResult = await testEmail(config)
        break
      case 'openai':
        testResult = await testOpenAI(config)
        break
      default:
        throw new Error(`Unknown service: ${service}`)
    }

    return new Response(
      JSON.stringify(testResult),
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

async function testWhatsApp(config: any) {
  try {
    if (!config.apiKey || !config.phoneNumber) {
      return { success: false, message: 'API Key e número do telefone são obrigatórios' }
    }

    // Test WhatsApp Business API connection
    const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumber}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      return { success: true, message: 'Conexão com WhatsApp estabelecida com sucesso!' }
    } else {
      const error = await response.json()
      return { success: false, message: `Erro na conexão: ${error.error?.message || 'Token inválido'}` }
    }
  } catch (error) {
    return { success: false, message: `Erro de conexão: ${error.message}` }
  }
}

async function testEmail(config: any) {
  try {
    if (!config.smtpHost || !config.username || !config.password) {
      return { success: false, message: 'Configurações SMTP incompletas' }
    }

    // For demo purposes, we'll simulate a successful connection
    // In production, you would actually test the SMTP connection
    const isValidConfig = config.smtpHost.includes('smtp') && 
                         config.username.includes('@') && 
                         config.password.length > 0

    if (isValidConfig) {
      return { success: true, message: 'Configuração SMTP válida!' }
    } else {
      return { success: false, message: 'Configurações SMTP inválidas' }
    }
  } catch (error) {
    return { success: false, message: `Erro na configuração: ${error.message}` }
  }
}

async function testOpenAI(config: any) {
  try {
    if (!config.apiKey) {
      return { success: false, message: 'API Key da OpenAI é obrigatória' }
    }

    // Test OpenAI API connection
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'Test connection' },
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10
      })
    })

    if (response.ok) {
      return { success: true, message: 'Conexão com OpenAI estabelecida com sucesso!' }
    } else {
      const error = await response.json()
      return { success: false, message: `Erro na API: ${error.error?.message || 'API Key inválida'}` }
    }
  } catch (error) {
    return { success: false, message: `Erro de conexão: ${error.message}` }
  }
}