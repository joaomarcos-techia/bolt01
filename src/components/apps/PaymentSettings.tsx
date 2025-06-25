import React, { useState } from 'react'
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download,
  AlertCircle,
  CheckCircle,
  Settings,
  Home,
  Crown,
  ExternalLink,
  Clock,
  XCircle,
  Trash2
} from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { getProductByPriceId } from '../../stripe-config'

interface PaymentSettingsProps {
  onBack: () => void
}

export function PaymentSettings({ onBack }: PaymentSettingsProps) {
  const [activeTab, setActiveTab] = useState<'subscription' | 'billing' | 'invoices'>('subscription')
  const [loading, setLoading] = useState(false)
  const { 
    subscription, 
    loading: subscriptionLoading, 
    isActive, 
    isTrialing,
    isPastDue, 
    isCanceled,
    getTrialDaysRemaining,
    cancelSubscription,
    reactivateSubscription,
    deleteSubscription
  } = useSubscription()

  const currentPlan = subscription ? getProductByPriceId(subscription.price_id || '') : null
  const trialDaysRemaining = getTrialDaysRemaining()

  const getStatusColor = () => {
    if (isTrialing()) return 'text-blue-600'
    if (isActive()) return 'text-green-600'
    if (isPastDue()) return 'text-yellow-600'
    if (isCanceled()) return 'text-red-600'
    return 'text-gray-600'
  }

  const getStatusLabel = () => {
    if (!subscription) return 'Sem assinatura'
    
    switch (subscription.subscription_status) {
      case 'trialing': return `Teste Gratuito (${trialDaysRemaining} dias restantes)`
      case 'active': return 'Ativo'
      case 'past_due': return 'Pagamento em Atraso'
      case 'canceled': return 'Cancelado'
      case 'incomplete': return 'Incompleto'
      case 'unpaid': return 'Não Pago'
      case 'paused': return 'Pausado'
      default: return subscription.subscription_status
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR')
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período atual.')) {
      return
    }

    try {
      setLoading(true)
      await cancelSubscription()
      alert('Assinatura cancelada com sucesso. Você continuará tendo acesso até o final do período atual.')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('Erro ao cancelar assinatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setLoading(true)
      await reactivateSubscription()
      alert('Assinatura reativada com sucesso!')
    } catch (error) {
      console.error('Error reactivating subscription:', error)
      alert('Erro ao reativar assinatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = async () => {
    if (!confirm('ATENÇÃO: Esta ação irá excluir permanentemente sua assinatura e você perderá acesso imediatamente. Esta ação não pode ser desfeita. Tem certeza?')) {
      return
    }

    if (!confirm('Última confirmação: Você realmente deseja excluir sua assinatura permanentemente?')) {
      return
    }

    try {
      setLoading(true)
      await deleteSubscription()
      alert('Assinatura excluída permanentemente.')
      // Redirect to landing page
      window.location.href = '/'
    } catch (error) {
      console.error('Error deleting subscription:', error)
      alert('Erro ao excluir assinatura. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = () => {
    alert('Redirecionando para o portal de gerenciamento do Stripe...')
  }

  const handleBackToLanding = () => {
    window.location.href = '/'
  }

  if (subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações de pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-neumorphism border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-2 rounded-xl mr-3 shadow-neumorphism">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pagamentos</h1>
                  <p className="text-sm text-gray-600">Gerencie sua assinatura e faturas</p>
                </div>
              </div>
            </div>
            <button 
              onClick={handleBackToLanding}
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
              title="Voltar à página inicial"
            >
              <Home size={20} className="mr-2" />
              <span className="hidden sm:inline">Página Inicial</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-neumorphism mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'subscription'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assinatura
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'billing'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Forma de Pagamento
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'invoices'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Faturas
              </button>
            </nav>
          </div>
        </div>

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-2xl shadow-neumorphism p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Plano Atual</h2>
              
              {subscription && currentPlan ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Crown className="text-yellow-600 mr-3" size={24} />
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{currentPlan.name}</h3>
                        <p className="text-gray-600">
                          R$ {currentPlan.price}/mês
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        isTrialing() ? 'bg-blue-500' : 
                        isActive() ? 'bg-green-500' : 
                        isPastDue() ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className={`font-medium ${getStatusColor()}`}>
                        {getStatusLabel()}
                      </span>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {isTrialing() && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <Clock className="text-blue-500 mr-3" size={20} />
                        <div>
                          <p className="text-blue-800 font-medium">Período de teste ativo</p>
                          <p className="text-blue-600 text-sm">
                            {trialDaysRemaining > 0 
                              ? `Seu teste gratuito termina em ${trialDaysRemaining} dia(s)`
                              : 'Seu teste gratuito termina hoje'
                            }
                            {subscription.current_period_end && (
                              ` (${formatDate(subscription.current_period_end)})`
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isPastDue() && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <AlertCircle className="text-yellow-500 mr-3" size={20} />
                        <div>
                          <p className="text-yellow-800 font-medium">Pagamento em atraso</p>
                          <p className="text-yellow-600 text-sm">
                            Atualize sua forma de pagamento para continuar usando o CoreFlow
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {subscription.cancel_at_period_end && (
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <XCircle className="text-orange-500 mr-3" size={20} />
                        <div>
                          <p className="text-orange-800 font-medium">Cancelamento agendado</p>
                          <p className="text-orange-600 text-sm">
                            Sua assinatura será cancelada em {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'breve'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isCanceled() && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center">
                        <AlertCircle className="text-red-500 mr-3" size={20} />
                        <div>
                          <p className="text-red-800 font-medium">Assinatura cancelada</p>
                          <p className="text-red-600 text-sm">
                            Sua assinatura foi cancelada. Reative para continuar usando o CoreFlow
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4 shadow-neumorphism-inset">
                      <div className="flex items-center mb-2">
                        <Calendar className="text-gray-500 mr-2" size={16} />
                        <span className="text-sm font-medium text-gray-700">
                          {isTrialing() ? 'Fim do teste' : 'Próxima cobrança'}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'N/A'}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 shadow-neumorphism-inset">
                      <div className="flex items-center mb-2">
                        <DollarSign className="text-gray-500 mr-2" size={16} />
                        <span className="text-sm font-medium text-gray-700">Valor</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">
                        {isTrialing() ? 'Grátis' : `R$ ${currentPlan.price}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-4">
                    <div className="flex space-x-4">
                      <button 
                        onClick={handleManageSubscription}
                        className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-medium shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300 flex items-center justify-center"
                      >
                        <ExternalLink size={16} className="mr-2" />
                        Gerenciar no Stripe
                      </button>
                      <button 
                        onClick={() => window.location.href = '/#precos'}
                        className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      >
                        Alterar Plano
                      </button>
                    </div>

                    {/* Subscription Actions */}
                    <div className="flex space-x-4">
                      {subscription.cancel_at_period_end ? (
                        <button 
                          onClick={handleReactivateSubscription}
                          disabled={loading}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Processando...' : 'Reativar Assinatura'}
                        </button>
                      ) : (
                        <button 
                          onClick={handleCancelSubscription}
                          disabled={loading}
                          className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Processando...' : 'Cancelar Assinatura'}
                        </button>
                      )}
                      
                      <button 
                        onClick={handleDeleteSubscription}
                        disabled={loading}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        <Trash2 size={16} className="mr-2" />
                        {loading ? 'Processando...' : 'Excluir Assinatura'}
                      </button>
                    </div>

                    {/* Warning for delete action */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <AlertCircle className="text-red-500 mr-3 mt-0.5" size={16} />
                        <div>
                          <p className="text-red-800 font-medium text-sm">Atenção</p>
                          <p className="text-red-600 text-xs mt-1">
                            <strong>Cancelar:</strong> Mantém acesso até o fim do período atual.<br/>
                            <strong>Excluir:</strong> Remove acesso imediatamente e não pode ser desfeito.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma assinatura ativa</h3>
                  <p className="text-gray-600 mb-6">
                    Você não possui uma assinatura ativa. Escolha um plano para começar a usar o CoreFlow.
                  </p>
                  <button 
                    onClick={() => window.location.href = '/#precos'}
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300"
                  >
                    Ver Planos
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-2xl shadow-neumorphism p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Forma de Pagamento</h2>
            
            {subscription?.payment_method_brand && subscription?.payment_method_last4 ? (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-neumorphism-inset">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center mr-4">
                      <span className="text-white text-xs font-bold">{subscription.payment_method_brand}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        •••• •••• •••• {subscription.payment_method_last4}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cartão principal
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300">
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 shadow-neumorphism-inset text-center">
                <CreditCard className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">Nenhuma forma de pagamento configurada</p>
              </div>
            )}

            <div className="space-y-4">
              <button 
                onClick={handleManageSubscription}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-medium shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300 flex items-center justify-center"
              >
                <ExternalLink size={16} className="mr-2" />
                Gerenciar Pagamento no Stripe
              </button>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-2xl shadow-neumorphism p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Histórico de Faturas</h2>
            
            <div className="text-center py-8">
              <Download className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Faturas não disponíveis</h3>
              <p className="text-gray-600 mb-6">
                Para acessar suas faturas, use o portal de gerenciamento do Stripe.
              </p>
              <button 
                onClick={handleManageSubscription}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-medium shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300 flex items-center justify-center mx-auto"
              >
                <ExternalLink size={16} className="mr-2" />
                Acessar Portal do Stripe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}