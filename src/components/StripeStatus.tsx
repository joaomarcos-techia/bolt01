import React from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { useSubscription } from '../hooks/useSubscription'

export function StripeStatus() {
  const { subscription, loading, isActive, isPastDue, isCanceled } = useSubscription()

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-xl p-4 flex items-center">
        <Clock className="text-gray-400 mr-3" size={20} />
        <span className="text-gray-600">Carregando status da assinatura...</span>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center">
        <AlertTriangle className="text-yellow-600 mr-3" size={20} />
        <div>
          <p className="text-yellow-800 font-medium">Nenhuma assinatura ativa</p>
          <p className="text-yellow-600 text-sm">Escolha um plano para começar</p>
        </div>
      </div>
    )
  }

  const getStatusInfo = () => {
    if (isActive()) {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        title: 'Assinatura Ativa',
        description: 'Sua assinatura está funcionando normalmente'
      }
    }
    
    if (isPastDue()) {
      return {
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        title: 'Pagamento Pendente',
        description: 'Atualize sua forma de pagamento'
      }
    }
    
    if (isCanceled()) {
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: 'Assinatura Cancelada',
        description: 'Reative sua assinatura para continuar'
      }
    }

    return {
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      title: 'Status Desconhecido',
      description: 'Verifique sua assinatura'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-xl p-4`}>
      <div className="flex items-center">
        <StatusIcon className={`${statusInfo.color} mr-3`} size={20} />
        <div>
          <p className={`${statusInfo.color} font-medium`}>{statusInfo.title}</p>
          <p className={`${statusInfo.color} text-sm opacity-80`}>{statusInfo.description}</p>
        </div>
      </div>
      
      {subscription && (
        <div className="mt-3 text-xs text-gray-600">
          <p>Status: {subscription.subscription_status}</p>
          {subscription.current_period_end && (
            <p>Próxima cobrança: {new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')}</p>
          )}
        </div>
      )}
    </div>
  )
}