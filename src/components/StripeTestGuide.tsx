import React from 'react'
import { CreditCard, CheckCircle, XCircle, AlertTriangle, ExternalLink } from 'lucide-react'

export function StripeTestGuide() {
  const testCards = [
    {
      number: '4242 4242 4242 4242',
      description: 'Visa - Pagamento bem-sucedido',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      number: '4000 0000 0000 0002',
      description: 'Visa - Cartão recusado',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      number: '4000 0000 0000 9995',
      description: 'Visa - Fundos insuficientes',
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      number: '4000 0000 0000 9987',
      description: 'Visa - CVC incorreto',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-neumorphism p-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-xl mr-4">
            <CreditCard className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Guia de Teste do Stripe
            </h2>
            <p className="text-gray-600">
              Use estes cartões para testar a integração de pagamento
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {testCards.map((card, index) => (
            <div key={index} className={`${card.bgColor} border border-gray-200 rounded-xl p-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <card.icon className={`${card.color} mr-3`} size={20} />
                  <div>
                    <code className="text-sm font-mono bg-white px-2 py-1 rounded">
                      {card.number}
                    </code>
                    <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Informações Adicionais para Teste
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Data de Expiração</h4>
              <p className="text-blue-700">Qualquer data futura (ex: 12/25)</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">CVC</h4>
              <p className="text-blue-700">Qualquer 3 dígitos (ex: 123)</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">CEP</h4>
              <p className="text-blue-700">Qualquer CEP válido (ex: 01310-100)</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Links Úteis
          </h3>
          <div className="space-y-3">
            <a 
              href="https://stripe.com/docs/testing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Documentação Completa de Teste do Stripe
            </a>
            <a 
              href="https://dashboard.stripe.com/test/payments" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Dashboard de Pagamentos de Teste
            </a>
            <a 
              href="https://dashboard.stripe.com/test/webhooks" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink size={16} className="mr-2" />
              Configuração de Webhooks
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}