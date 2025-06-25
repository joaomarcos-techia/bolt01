import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, CreditCard, Calendar, User, Star, Zap, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';

export function SuccessPage() {
  const { user, getUserDisplayName } = useAuth();
  const { subscription, loading, refetch, isTrialing, getTrialDaysRemaining } = useSubscription();
  const [isRefetching, setIsRefetching] = useState(false);

  useEffect(() => {
    // Refetch subscription data when component mounts to get latest info
    const refetchData = async () => {
      setIsRefetching(true);
      await refetch();
      setIsRefetching(false);
    };

    if (user) {
      refetchData();
    }
  }, [user, refetch]);

  const activePlan = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;
  const trialDaysRemaining = getTrialDaysRemaining();

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (loading || isRefetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações da sua assinatura...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-neumorphism p-8 text-center mb-6">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-neumorphism">
            <CheckCircle size={40} className="text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 {isTrialing() ? 'Teste Gratuito Ativado!' : 'Pagamento Confirmado!'}
          </h1>
          <p className="text-gray-600 mb-8">
            {isTrialing() 
              ? `Bem-vindo ao CoreFlow, ${getUserDisplayName()}! Seu teste gratuito de 7 dias foi ativado com sucesso.`
              : `Bem-vindo ao CoreFlow, ${getUserDisplayName()}! Sua assinatura foi ativada com sucesso.`
            }
          </p>

          {/* Trial Status */}
          {isTrialing() && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 shadow-neumorphism-inset">
              <div className="flex items-center justify-center mb-4">
                <Clock className="text-blue-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-blue-900">Teste Gratuito Ativo</h3>
              </div>
              <p className="text-blue-700 mb-4">
                Você tem <strong>{trialDaysRemaining} dias</strong> para explorar todas as funcionalidades do CoreFlow gratuitamente.
              </p>
              <div className="bg-blue-100 rounded-xl p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Importante:</strong> Seu cartão foi validado mas não será cobrado durante o período de teste. 
                  A primeira cobrança ocorrerá apenas após {trialDaysRemaining} dias, e você pode cancelar a qualquer momento.
                </p>
              </div>
            </div>
          )}

          {/* Plan Details */}
          {activePlan && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-8 shadow-neumorphism-inset">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da Sua Assinatura</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center">
                    <CreditCard className="text-gray-500 mr-3" size={20} />
                    <span className="text-gray-700">Plano</span>
                  </div>
                  <span className="font-semibold text-gray-900">{activePlan.name}</span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center">
                    <Calendar className="text-gray-500 mr-3" size={20} />
                    <span className="text-gray-700">Valor</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {isTrialing() ? 'Grátis por 7 dias' : `R$ ${activePlan.price.toFixed(2).replace('.', ',')}/mês`}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center">
                    <User className="text-gray-500 mr-3" size={20} />
                    <span className="text-gray-700">Status</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {isTrialing() ? 'Teste Ativo' : 'Ativo'}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center">
                    <Star className="text-gray-500 mr-3" size={20} />
                    <span className="text-gray-700">
                      {isTrialing() ? 'Fim do teste' : 'Próxima cobrança'}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {subscription?.current_period_end 
                      ? new Date(subscription.current_period_end * 1000).toLocaleDateString('pt-BR')
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-2xl font-medium shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300 flex items-center justify-center mb-6"
          >
            <Zap className="mr-2" size={20} />
            Acessar Meu Dashboard
            <ArrowRight className="ml-2" size={20} />
          </button>

          {/* Trial Reminder */}
          {isTrialing() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Star className="text-yellow-600 mr-2" size={20} />
                <span className="text-yellow-800 font-medium">Lembrete Importante</span>
              </div>
              <p className="text-yellow-700 text-sm">
                Durante o teste gratuito, você tem acesso completo a todas as funcionalidades. 
                Você pode cancelar a qualquer momento sem nenhuma cobrança através das configurações de pagamento.
              </p>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl shadow-neumorphism p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            🚀 Próximos Passos
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">1. Configure seu CoreCRM</h4>
              <p className="text-gray-600 text-sm">Importe seus leads e configure automações de vendas</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">2. Organize com CoreTask</h4>
              <p className="text-gray-600 text-sm">Crie suas primeiras tarefas e projetos</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">3. Controle com CoreFinance</h4>
              <p className="text-gray-600 text-sm">Configure suas contas e categorias financeiras</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">4. Otimize com CorePulse</h4>
              <p className="text-gray-600 text-sm">Explore insights e configure automações inteligentes</p>
            </div>
          </div>
        </div>

        {/* Support Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Precisa de ajuda? Entre em contato com nosso{' '}
            <a href="mailto:suporte@coreflow.com" className="text-blue-600 hover:text-blue-800 font-medium">
              suporte especializado
            </a>
            {' '}ou acesse nossa{' '}
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
              central de ajuda
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}