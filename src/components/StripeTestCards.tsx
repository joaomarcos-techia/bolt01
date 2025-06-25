import React from 'react'
import { CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export function StripeTestCards() {
  const testCards = [
    {
      number: '4242 4242 4242 4242',
      description: 'Cartão de teste - Pagamento bem-sucedido',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      number: '4000 0000 0000 0002',
      description: 'Cartão de teste - Pagamento recusado',
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      number: '4000 0000 0000 9995',
      description: 'Cartão de teste - Fundos insuficientes',
      icon: AlertCircle,
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
      <div className="flex items-center mb-4">
        <CreditCard className="text-blue-600 mr-3" size={24} />
        <h3 className="text-lg font-semibold text-blue-900">
          Cartões de Teste do Stripe
        </h3>
      </div>
      
      <p className="text-blue-700 text-sm mb-4">
        Use estes cartões para testar a integração de pagamento:
      </p>
      
      <div className="space-y-3">
        {testCards.map((card, index) => (
          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3">
            <div className="flex items-center">
              <card.icon className={`${card.color} mr-3`} size={16} />
              <div>
                <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {card.number}
                </code>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-blue-600">
        <p>• Use qualquer data de expiração futura</p>
        <p>• Use qualquer CVC de 3 dígitos</p>
        <p>• Use qualquer CEP válido</p>
      </div>
    </div>
  )
}