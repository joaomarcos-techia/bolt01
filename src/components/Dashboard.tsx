import React, { useState, useEffect } from 'react'
import { 
  LogOut, 
  Settings, 
  Users, 
  Activity, 
  CheckSquare, 
  DollarSign,
  MessageCircle,
  Mail,
  Bot,
  BarChart3,
  Calendar,
  AlertTriangle,
  TrendingUp,
  FileText,
  CreditCard,
  PieChart,
  ArrowRight,
  Plus,
  Bell,
  Target,
  Zap,
  RefreshCw,
  AlertCircle,
  Home,
  Crown,
  User,
  Gift,
  ChevronDown,
  X,
  Webhook,
  Key,
  Palette,
  Database,
  Save,
  Check
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLeads } from '../hooks/useLeads'
import { useTasks } from '../hooks/useTasks'
import { useTransactions } from '../hooks/useTransactions'
import { useAutomations } from '../hooks/useAutomations'
import { useInsights } from '../hooks/useInsights'
import { useNotifications } from '../hooks/useNotifications'
import { useSubscription } from '../hooks/useSubscription'
import { CoreCRM } from './apps/CoreCRM'
import { CoreTask } from './apps/CoreTask'
import { CoreFinance } from './apps/CoreFinance'
import { CorePulse } from './apps/CorePulse'
import { PaymentSettings } from './apps/PaymentSettings'
import { ProfileSettings } from './apps/ProfileSettings'

export function Dashboard() {
  const { user, signOut, getUserDisplayName, getUserPhotoUrl, isFreeUser } = useAuth()
  const [selectedApp, setSelectedApp] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [settingsTab, setSettingsTab] = useState<'saas' | 'payments' | 'apis' | 'webhooks'>('saas')
  const [settingsData, setSettingsData] = useState({
    saas: {
      corecrm: { enabled: true, autoSync: true, notifications: true },
      coretask: { enabled: true, autoSync: true, notifications: true },
      corefinance: { enabled: true, autoSync: true, notifications: true },
      corepulse: { enabled: true, autoSync: true, notifications: true }
    },
    apis: {
      openai: { key: '', model: 'gpt-3.5-turbo' },
      whatsapp: { token: '', phoneNumber: '' },
      email: { smtp: '', username: '', password: '' }
    },
    webhooks: {
      stripe: { url: '', secret: '' },
      whatsapp: { url: '', secret: '' },
      custom: { url: '', secret: '' }
    }
  })

  // Use all the custom hooks with error handling
  const { stats: leadStats, loading: leadsLoading, error: leadsError } = useLeads()
  const { stats: taskStats, loading: tasksLoading, error: tasksError } = useTasks()
  const { stats: financeStats, loading: financeLoading, error: financeError } = useTransactions()
  const { stats: automationStats, loading: automationsLoading, error: automationsError } = useAutomations()
  const { insights, stats: insightStats, loading: insightsLoading, error: insightsError } = useInsights()
  const { notifications, stats: notificationStats, error: notificationsError, markAsRead, markAllAsRead } = useNotifications()
  const { subscription, getActivePlan, isActive } = useSubscription()

  // Check for any connection errors
  useEffect(() => {
    const errors = [leadsError, tasksError, financeError, automationsError, insightsError, notificationsError]
    const firstError = errors.find(error => error !== null)
    
    if (firstError) {
      setConnectionError(firstError)
    } else {
      setConnectionError(null)
    }
  }, [leadsError, tasksError, financeError, automationsError, insightsError, notificationsError])

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('coreflow-settings')
    if (savedSettings) {
      try {
        setSettingsData(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: typeof settingsData) => {
    setSettingsData(newSettings)
    localStorage.setItem('coreflow-settings', JSON.stringify(newSettings))
  }

  const activePlan = getActivePlan()

  const coreApps = [
    {
      id: 'crm',
      name: 'CoreCRM',
      icon: Users,
      description: 'CRM ultra-simples com foco em WhatsApp e Email + automação',
      color: 'from-blue-500 to-blue-600',
      features: [
        'Manipulação de leads via chat',
        'Histórico de interações',
        'Lembretes automáticos de follow-up',
        'Chatbot especializado em vendas',
        'Sistema de tags personalizadas',
        'Gestão de funil de vendas'
      ],
      stats: [
        { label: 'Leads Ativos', value: leadStats?.total?.toString() || '0', icon: Users },
        { label: 'Conversões', value: leadStats?.conversionRate || '0%', icon: TrendingUp },
        { label: 'Qualificados', value: leadStats?.qualified?.toString() || '0', icon: MessageCircle }
      ],
      loading: leadsLoading,
      error: leadsError,
      enabled: settingsData.saas.corecrm.enabled
    },
    {
      id: 'pulse',
      name: 'CorePulse',
      icon: Activity,
      description: 'Sistema nervoso central inteligente para otimização automática',
      color: 'from-purple-500 to-purple-600',
      features: [
        'Análise de dados operacionais',
        'Detecção de padrões e gargalos',
        'Propostas de ações automatizáveis',
        'Monitoramento de ROI',
        'Alertas inteligentes',
        'Otimização de decisões'
      ],
      stats: [
        { label: 'Insights Gerados', value: insightStats?.total?.toString() || '0', icon: Zap },
        { label: 'Não Lidos', value: insightStats?.unread?.toString() || '0', icon: Bell },
        { label: 'Aplicados', value: insightStats?.applied?.toString() || '0', icon: Bot }
      ],
      loading: insightsLoading,
      error: insightsError,
      enabled: settingsData.saas.corepulse.enabled
    },
    {
      id: 'tasks',
      name: 'CoreTask',
      icon: CheckSquare,
      description: 'Plataforma leve de gestão de tarefas e produtividade',
      color: 'from-green-500 to-green-600',
      features: [
        'Kanban simples com notificações',
        'Tarefas com datas e responsáveis',
        'Alertas no WhatsApp',
        'Tags de nível de importância',
        'Integração com IA para decisões',
        'Colaboração em tempo real'
      ],
      stats: [
        { label: 'Tarefas Ativas', value: taskStats?.active?.toString() || '0', icon: CheckSquare },
        { label: 'Concluídas', value: taskStats?.completionRate || '0%', icon: Target },
        { label: 'Em Atraso', value: taskStats?.overdue?.toString() || '0', icon: AlertTriangle }
      ],
      loading: tasksLoading,
      error: tasksError,
      enabled: settingsData.saas.coretask.enabled
    },
    {
      id: 'finance',
      name: 'CoreFinance',
      icon: DollarSign,
      description: 'Controle financeiro completo para seu negócio',
      color: 'from-orange-500 to-orange-600',
      features: [
        'Dashboard financeiro completo',
        'Registro de transações',
        'Contas a pagar e receber',
        'Relatórios e exportação',
        'Previsão financeira básica',
        'Automatizações CoreBot'
      ],
      stats: [
        { label: 'Saldo Total', value: `R$ ${((financeStats?.totalBalance || 0) / 1000).toFixed(1)}k`, icon: CreditCard },
        { label: 'Receita Mensal', value: `R$ ${((financeStats?.monthlyIncome || 0) / 1000).toFixed(1)}k`, icon: TrendingUp },
        { label: 'Transações', value: financeStats?.transactionCount?.toString() || '0', icon: FileText }
      ],
      loading: financeLoading,
      error: financeError,
      enabled: settingsData.saas.corefinance.enabled
    }
  ]

  const recentActivities = [
    {
      app: 'CoreCRM',
      action: 'Novo lead convertido',
      time: '2 min atrás',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      app: 'CorePulse',
      action: 'Insight sobre campanha detectado',
      time: '15 min atrás',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      app: 'CoreTask',
      action: 'Tarefa "Reunião cliente" concluída',
      time: '1h atrás',
      icon: CheckSquare,
      color: 'text-green-600'
    },
    {
      app: 'CoreFinance',
      action: `Receita de R$ ${((financeStats?.monthlyIncome || 0) / 1000).toFixed(1)}k registrada`,
      time: '2h atrás',
      icon: DollarSign,
      color: 'text-orange-600'
    }
  ]

  const overallStats = [
    {
      label: 'Receita Total',
      value: `R$ ${((financeStats?.totalBalance || 0) / 1000).toFixed(1)}k`,
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600',
      loading: financeLoading
    },
    {
      label: 'Leads Convertidos',
      value: leadStats?.won?.toString() || '0',
      change: '+8%',
      icon: Users,
      color: 'text-blue-600',
      loading: leadsLoading
    },
    {
      label: 'Taxa de Conclusão',
      value: taskStats?.completionRate || '0%',
      change: '+5%',
      icon: CheckSquare,
      color: 'text-green-600',
      loading: tasksLoading
    },
    {
      label: 'Automações Ativas',
      value: automationStats?.active?.toString() || '0',
      change: '+15%',
      icon: Activity,
      color: 'text-purple-600',
      loading: automationsLoading
    }
  ]

  const handleRefreshData = async () => {
    setRefreshing(true)
    // Force page reload to refresh all data
    window.location.reload()
  }

  const handleAppAccess = (appId: string) => {
    setSelectedApp(appId)
  }

  const handleBackToLanding = () => {
    window.history.pushState({}, '', '/')
    window.location.reload()
  }

  const handleSignOut = async () => {
    if (confirm('Tem certeza que deseja sair da sua conta?')) {
      await signOut()
      window.history.pushState({}, '', '/')
      window.location.reload()
    }
  }

  const handleNotificationClick = async (notificationId: string) => {
    await markAsRead(notificationId)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  const handleSaasToggle = (saasId: string, field: string, value: boolean) => {
    const newSettings = {
      ...settingsData,
      saas: {
        ...settingsData.saas,
        [saasId]: {
          ...settingsData.saas[saasId as keyof typeof settingsData.saas],
          [field]: value
        }
      }
    }
    saveSettings(newSettings)
  }

  const handleApiUpdate = (apiId: string, field: string, value: string) => {
    const newSettings = {
      ...settingsData,
      apis: {
        ...settingsData.apis,
        [apiId]: {
          ...settingsData.apis[apiId as keyof typeof settingsData.apis],
          [field]: value
        }
      }
    }
    saveSettings(newSettings)
  }

  const handleWebhookUpdate = (webhookId: string, field: string, value: string) => {
    const newSettings = {
      ...settingsData,
      webhooks: {
        ...settingsData.webhooks,
        [webhookId]: {
          ...settingsData.webhooks[webhookId as keyof typeof settingsData.webhooks],
          [field]: value
        }
      }
    }
    saveSettings(newSettings)
  }

  // Render individual app components
  if (selectedApp === 'crm') {
    return <CoreCRM onBack={() => setSelectedApp(null)} />
  }
  
  if (selectedApp === 'tasks') {
    return <CoreTask onBack={() => setSelectedApp(null)} />
  }
  
  if (selectedApp === 'finance') {
    return <CoreFinance onBack={() => setSelectedApp(null)} />
  }
  
  if (selectedApp === 'pulse') {
    return <CorePulse onBack={() => setSelectedApp(null)} />
  }

  if (selectedApp === 'payments') {
    return <PaymentSettings onBack={() => setSelectedApp(null)} />
  }

  if (selectedApp === 'profile') {
    return <ProfileSettings onBack={() => setSelectedApp(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-neumorphism border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-black">CoreFlow</h1>
              <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full shadow-neumorphism-inset">
                Dashboard Central
              </span>
              {isFreeUser() && (
                <span className="ml-2 px-3 py-1 bg-gradient-to-r from-green-400 to-green-600 text-white text-sm rounded-full shadow-neumorphism flex items-center">
                  <Gift size={14} className="mr-1" />
                  Acesso VIP
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBackToLanding}
                className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                title="Voltar à página inicial"
              >
                <Home size={20} className="mr-2" />
                <span className="hidden sm:inline">Página Inicial</span>
              </button>
              
              <button 
                onClick={handleRefreshData}
                className={`text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300 ${refreshing ? 'animate-spin' : ''}`}
                disabled={refreshing}
                title="Recarregar página"
              >
                <RefreshCw size={20} />
              </button>
              
              {!isFreeUser() && (
                <button 
                  onClick={() => setSelectedApp('payments')}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                  title="Gerenciar pagamentos"
                >
                  <CreditCard size={20} />
                </button>
              )}
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                  title="Notificações"
                >
                  <Bell size={20} />
                  {(notificationStats?.unread || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {(notificationStats?.unread || 0) > 9 ? '9+' : notificationStats?.unread}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-neumorphism border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                        <div className="flex items-center space-x-2">
                          {(notificationStats?.unread || 0) > 0 && (
                            <button
                              onClick={handleMarkAllAsRead}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Marcar todas como lidas
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.is_read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                                notification.type === 'error' ? 'bg-red-500' :
                                notification.type === 'warning' ? 'bg-yellow-500' :
                                notification.type === 'success' ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notification.created_at).toLocaleString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell size={32} className="mx-auto mb-2 opacity-50" />
                          <p>Nenhuma notificação</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                  title="Configurações"
                >
                  <Settings size={20} />
                </button>

                {showSettings && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-neumorphism border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
                        <button
                          onClick={() => setShowSettings(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Settings Tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex">
                        {[
                          { id: 'saas', label: 'SaaS', icon: Database },
                          { id: 'payments', label: 'Pagamentos', icon: CreditCard },
                          { id: 'apis', label: 'APIs', icon: Key },
                          { id: 'webhooks', label: 'Webhooks', icon: Webhook }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setSettingsTab(tab.id as any)}
                            className={`flex-1 py-2 px-3 text-xs font-medium border-b-2 transition-colors ${
                              settingsTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <tab.icon size={14} className="mx-auto mb-1" />
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>

                    <div className="max-h-96 overflow-y-auto p-4">
                      {/* SaaS Settings */}
                      {settingsTab === 'saas' && (
                        <div className="space-y-4">
                          {Object.entries(settingsData.saas).map(([saasId, config]) => (
                            <div key={saasId} className="border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900 mb-2 capitalize">{saasId}</h4>
                              <div className="space-y-2">
                                {Object.entries(config).map(([field, value]) => (
                                  <label key={field} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 capitalize">{field}</span>
                                    <input
                                      type="checkbox"
                                      checked={value as boolean}
                                      onChange={(e) => handleSaasToggle(saasId, field, e.target.checked)}
                                      className="rounded"
                                    />
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Payments Settings */}
                      {settingsTab === 'payments' && (
                        <div className="space-y-4">
                          <button
                            onClick={() => setSelectedApp('payments')}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Gerenciar Pagamentos
                          </button>
                          <button
                            onClick={() => setSelectedApp('profile')}
                            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Configurações de Perfil
                          </button>
                        </div>
                      )}

                      {/* APIs Settings */}
                      {settingsTab === 'apis' && (
                        <div className="space-y-4">
                          {Object.entries(settingsData.apis).map(([apiId, config]) => (
                            <div key={apiId} className="border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900 mb-2 capitalize">{apiId}</h4>
                              <div className="space-y-2">
                                {Object.entries(config).map(([field, value]) => (
                                  <div key={field}>
                                    <label className="block text-sm text-gray-600 capitalize mb-1">{field}</label>
                                    <input
                                      type={field.includes('password') || field.includes('key') || field.includes('token') ? 'password' : 'text'}
                                      value={value as string}
                                      onChange={(e) => handleApiUpdate(apiId, field, e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder={`Digite ${field}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Webhooks Settings */}
                      {settingsTab === 'webhooks' && (
                        <div className="space-y-4">
                          {Object.entries(settingsData.webhooks).map(([webhookId, config]) => (
                            <div key={webhookId} className="border border-gray-200 rounded-lg p-3">
                              <h4 className="font-medium text-gray-900 mb-2 capitalize">{webhookId}</h4>
                              <div className="space-y-2">
                                {Object.entries(config).map(([field, value]) => (
                                  <div key={field}>
                                    <label className="block text-sm text-gray-600 capitalize mb-1">{field}</label>
                                    <input
                                      type={field.includes('secret') ? 'password' : 'url'}
                                      value={value as string}
                                      onChange={(e) => handleWebhookUpdate(webhookId, field, e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder={`Digite ${field}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200">
                      <div className="flex items-center text-xs text-gray-500">
                        <Save size={12} className="mr-1" />
                        Configurações salvas automaticamente
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-gray-500 hover:text-gray-700 p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
                  title="Menu do usuário"
                >
                  {getUserPhotoUrl() ? (
                    <img 
                      src={getUserPhotoUrl()!} 
                      alt="Foto de perfil" 
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <User size={16} className="text-gray-600" />
                    </div>
                  )}
                  <ChevronDown size={16} className="ml-1" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-neumorphism border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center">
                        {getUserPhotoUrl() ? (
                          <img 
                            src={getUserPhotoUrl()!} 
                            alt="Foto de perfil" 
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <User size={24} className="text-gray-600" />
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">{getUserDisplayName()}</p>
                          <p className="text-sm text-gray-600">{user?.email}</p>
                          {isFreeUser() && (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                              <Gift size={10} className="mr-1" />
                              VIP
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setSelectedApp('profile')
                          setShowUserMenu(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                      >
                        <User size={16} className="mr-3" />
                        Configurações de Perfil
                      </button>
                      
                      {!isFreeUser() && (
                        <button
                          onClick={() => {
                            setSelectedApp('payments')
                            setShowUserMenu(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <CreditCard size={16} className="mr-3" />
                          Gerenciar Pagamentos
                        </button>
                      )}
                      
                      <hr className="my-2" />
                      
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          handleSignOut()
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                      >
                        <LogOut size={16} className="mr-3" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Connection Error Alert */}
        {connectionError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 shadow-neumorphism">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Problema de Conexão com o Banco de Dados
                </h3>
                <p className="text-red-700 mb-4">
                  {connectionError}
                </p>
                <div className="bg-red-100 rounded-xl p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Como resolver:</h4>
                  <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
                    <li>Acesse seu <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Dashboard do Supabase</a></li>
                    <li>Vá em "SQL Editor" no menu lateral</li>
                    <li>Clique em "New query"</li>
                    <li>Copie e cole o conteúdo do arquivo <code className="bg-red-200 px-1 rounded">supabase/migrations/20250617052813_rustic_spring.sql</code></li>
                    <li>Clique em "Run" para executar a migração</li>
                    <li>Atualize esta página</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Free User Banner */}
        {isFreeUser() && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl p-6 shadow-neumorphism">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Gift className="text-green-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                    🎉 Acesso VIP Ativado
                  </h3>
                  <p className="text-green-700">
                    Você tem acesso completo e gratuito a todas as funcionalidades do CoreFlow!
                  </p>
                </div>
              </div>
              <Crown className="text-yellow-500" size={32} />
            </div>
          </div>
        )}

        {/* Subscription Status for non-free users */}
        {!isFreeUser() && subscription && !isActive() && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-neumorphism">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="text-yellow-600 mr-3" size={24} />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                    Assinatura Inativa
                  </h3>
                  <p className="text-yellow-700">
                    Sua assinatura está {subscription.subscription_status}. Atualize seu plano para continuar usando todos os recursos.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedApp('payments')}
                className="bg-yellow-600 text-white px-6 py-2 rounded-xl hover:bg-yellow-700 transition-colors"
              >
                Gerenciar Assinatura
              </button>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">
            Bem-vindo ao CoreFlow, {getUserDisplayName()}!
          </h2>
          <p className="text-gray-600">
            Gerencie todos os seus SaaS em uma única plataforma integrada
            {isFreeUser() ? (
              <span className="ml-2 inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm rounded-full">
                <Gift size={12} className="mr-1" />
                Acesso VIP Gratuito
              </span>
            ) : activePlan && (
              <span className="ml-2 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                <Crown size={12} className="mr-1" />
                {activePlan.name}
              </span>
            )}
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallStats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-neumorphism border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  {stat.loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
                  ) : (
                    <>
                      <p className="text-2xl font-bold text-black mt-1">{stat.value}</p>
                      <p className={`text-sm font-medium mt-1 ${stat.color}`}>
                        {stat.change} vs mês anterior
                      </p>
                    </>
                  )}
                </div>
                <div className={`p-3 rounded-xl bg-gray-50 ${stat.color} shadow-neumorphism-inset`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Core Apps */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black">Seus Aplicativos CoreFlow</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {coreApps.filter(app => app.enabled).map((app) => (
                <div 
                  key={app.id}
                  className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 overflow-hidden hover:shadow-neumorphism-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`h-2 bg-gradient-to-r ${app.color}`}></div>
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${app.color} text-white mr-4 shadow-neumorphism`}>
                        <app.icon size={24} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-black">{app.name}</h4>
                        <p className="text-sm text-gray-600">{app.description}</p>
                      </div>
                    </div>

                    {/* App Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {app.stats.map((stat, idx) => (
                        <div key={idx} className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <stat.icon size={16} className="text-gray-500" />
                          </div>
                          {app.loading ? (
                            <div className="h-6 w-8 bg-gray-200 rounded animate-pulse mx-auto mb-1"></div>
                          ) : (
                            <p className="text-lg font-bold text-black">{stat.value}</p>
                          )}
                          <p className="text-xs text-gray-600">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {app.error ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                        <p className="text-red-700 text-sm">
                          Erro ao carregar dados: {app.error}
                        </p>
                      </div>
                    ) : null}

                    <button 
                      onClick={() => handleAppAccess(app.id)}
                      className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center shadow-neumorphism hover:shadow-neumorphism-hover"
                      disabled={!!app.error}
                    >
                      Acessar {app.name}
                      <ArrowRight className="ml-2" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div>
            <h3 className="text-xl font-bold text-black mb-6">Atividades Recentes</h3>
            <div className="bg-white rounded-2xl shadow-neumorphism border border-gray-200 p-6">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    <div className={`p-2 rounded-xl bg-gray-50 mr-3 ${activity.color} shadow-neumorphism-inset`}>
                      <activity.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.app} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 text-center text-sm text-gray-600 hover:text-black transition-colors">
                Ver todas as atividades
              </button>
            </div>
          </div>
        </div>

        {/* CorePulse Insights */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-8 text-white shadow-neumorphism">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">💡 Insights do CorePulse</h3>
              <p className="text-purple-100 mb-4">
                Seu assistente inteligente detectou algumas oportunidades
              </p>
              <div className="space-y-2">
                {insightsLoading ? (
                  <div className="space-y-2">
                    <div className="bg-white/10 rounded-xl p-3 h-12 animate-pulse"></div>
                    <div className="bg-white/10 rounded-xl p-3 h-12 animate-pulse"></div>
                    <div className="bg-white/10 rounded-xl p-3 h-12 animate-pulse"></div>
                  </div>
                ) : insights && insights.length > 0 ? (
                  insights.slice(0, 3).map((insight, index) => (
                    <div key={index} className="bg-white/10 rounded-xl p-3 shadow-neumorphism-inset">
                      <p className="text-sm">{insight.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white/10 rounded-xl p-3 shadow-neumorphism-inset">
                    <p className="text-sm">Analisando seus dados para gerar insights personalizados...</p>
                  </div>
                )}
              </div>
            </div>
            <div className="ml-6">
              <button 
                onClick={() => setSelectedApp('pulse')}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors font-medium shadow-neumorphism hover:shadow-neumorphism-hover"
              >
                Ver Todos os Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showNotifications || showSettings || showUserMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowNotifications(false)
            setShowSettings(false)
            setShowUserMenu(false)
          }}
        />
      )}
    </div>
  )
}