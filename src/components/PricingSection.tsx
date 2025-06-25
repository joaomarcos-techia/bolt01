import React, { useState } from 'react'
import { Check, Star, Zap, Crown, Loader2, Clock, CreditCard } from 'lucide-react'
import { stripeProducts } from '../stripe-config'
import { useSubscription } from '../hooks/useSubscription'
import { useAuth } from '../contexts/AuthContext'

interface PricingSectionProps {
  onSelectPlan?: (planId: string) => void
}

export function PricingSection({ onSelectPlan }: PricingSectionProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { user } = useAuth()
  const { createCheckoutSession, subscription, isActive, isTrialing, getTrialDaysRemaining } = useSubscription()

  const planIcons = {
    'Plano Starter': Star,
    'Plano Profissional': Zap,
    'Plano Enterprise': Crown
  }

  const planColors = {
    'Plano Starter': 'from-blue-400 to-blue-600',
    'Plano Profissional': 'from-purple-400 to-purple-600',
    'Plano Enterprise': 'from-amber-400 to-amber-600'
  }

  const planFeatures = {
    'Plano Starter': [
      'Até 100 leads no CoreCRM',
      'Até 50 tarefas no CoreTask',
      'Controle financeiro básico',
      '3 automações simples',
      'Suporte por email',
      '1 usuário',
      'Relatórios básicos',
      'Integração WhatsApp'
    ],
    'Plano Profissional': [
      'Leads ilimitados no CoreCRM',
      'Tarefas ilimitadas no CoreTask',
      'CoreFinance completo',
      'Até 20 automações',
      'Insights básicos do CorePulse',
      'Integrações WhatsApp e Email',
      'Relatórios avançados',
      'Suporte prioritário',
      'Até 5 usuários',
      'API básica'
    ],
    'Plano Enterprise': [
      'Tudo do Profissional',
      'Automações ilimitadas',
      'CorePulse com IA avançada',
      'Todas as integrações disponíveis',
      'API personalizada completa',
      'Relatórios personalizados',
      'Suporte 24/7 dedicado',
      'Usuários ilimitados',
      'Treinamento personalizado',
      'Backup e segurança avançada',
      'Gerente de conta dedicado',
      'SLA garantido'
    ]
  }

  const handleSelectPlan = async (product: typeof stripeProducts[0]) => {
    if (!user) {
      if (onSelectPlan) {
        onSelectPlan(product.id)
      }
      return
    }

    try {
      setLoadingPlan(product.id)
      await createCheckoutSession(product.priceId, product.trialDays || 7)
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Erro ao processar pagamento. Tente novamente.')
    } finally {
      setLoadingPlan(null)
    }
  }

  const isCurrentPlan = (product: typeof stripeProducts[0]) => {
    return subscription?.price_id === product.priceId && isActive()
  }

  const trialDaysRemaining = getTrialDaysRemaining()

  return (
    <section id="precos" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Comece com 7 dias grátis. Cancele quando quiser. Todos os planos incluem acesso completo ao CoreFlow.
          </p>
          
          {/* Trial Status Banner */}
          {user && isTrialing() && (
            <div className="max-w-2xl mx-auto mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-center">
                <Clock className="text-blue-600 mr-3" size={20} />
                <div>
                  <p className="text-blue-800 font-medium">
                    Teste Gratuito Ativo
                  </p>
                  <p className="text-blue-600 text-sm">
                    {trialDaysRemaining > 0 
                      ? `${trialDaysRemaining} dia(s) restante(s) do seu teste gratuito`
                      : 'Seu teste gratuito expira hoje'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {stripeProducts.map((product, index) => {
            const IconComponent = planIcons[product.name as keyof typeof planIcons] || Star
            const isPopular = product.name === 'Plano Profissional'
            const isCurrent = isCurrentPlan(product)
            const isLoading = loadingPlan === product.id
            
            return (
              <div
                key={product.id}
                className={`relative bg-white rounded-3xl p-8 shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300 ${
                  isPopular ? 'ring-2 ring-purple-500 transform scale-105' : ''
                } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
              >
                {isPopular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                      Mais Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
                      {isTrialing() ? 'Teste Ativo' : 'Plano Atual'}
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${planColors[product.name as keyof typeof planColors]} text-white mb-4 shadow-neumorphism`}>
                    <IconComponent size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-6">{product.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-gray-600 ml-2">
                        /mês
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {user ? 'Cobrança mensal • Cancele quando quiser' : '7 dias grátis • Cartão necessário • Cancele quando quiser'}
                    </p>
                  </div>

                  {/* Trial Information */}
                  {!user && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center justify-center mb-2">
                        <CreditCard className="text-green-600 mr-2" size={16} />
                        <span className="text-green-800 font-medium text-sm">Teste Gratuito de 7 Dias</span>
                      </div>
                      <p className="text-green-700 text-xs">
                        Cartão necessário para validação • Primeira cobrança apenas após 7 dias
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 mb-8">
                  {planFeatures[product.name as keyof typeof planFeatures]?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <Check size={14} className="text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSelectPlan(product)}
                  disabled={isCurrent || isLoading}
                  className={`w-full py-4 rounded-2xl font-medium transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center ${
                    isCurrent
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : isPopular
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Processando...
                    </>
                  ) : isCurrent ? (
                    isTrialing() ? 'Teste Ativo' : 'Plano Atual'
                  ) : user ? (
                    'Assinar Agora'
                  ) : (
                    'Começar teste grátis'
                  )}
                </button>
                
                <p className="text-center text-xs text-gray-500 mt-4">
                  {user ? 'Cobrança mensal • Cancele quando quiser' : '7 dias grátis • Cartão necessário • Cancele quando quiser'}
                </p>
              </div>
            )
          })}
        </div>

        {/* Garantia e Benefícios */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-neumorphism p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Por que escolher o CoreFlow?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">7 dias grátis</h4>
                <p className="text-gray-600 text-sm">Teste todas as funcionalidades sem compromisso</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Suporte especializado</h4>
                <p className="text-gray-600 text-sm">Equipe técnica sempre disponível para ajudar</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Crown className="text-purple-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Sem fidelidade</h4>
                <p className="text-gray-600 text-sm">Cancele quando quiser, sem multas ou taxas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}