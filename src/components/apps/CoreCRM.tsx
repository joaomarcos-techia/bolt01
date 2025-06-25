import React, { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MessageCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Star,
  Calendar,
  DollarSign,
  Home,
  Settings,
  Bot,
  Zap,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Key,
  Webhook,
  MessageSquare,
  Send,
  ArrowRight,
  X
} from 'lucide-react'
import { useLeads } from '../../hooks/useLeads'
import { useIntegrations } from '../../hooks/useIntegrations'

interface CoreCRMProps {
  onBack: () => void
}

export function CoreCRM({ onBack }: CoreCRMProps) {
  const { leads, loading, createLead, updateLead, deleteLead } = useLeads()
  const { integrations, saveIntegration, testIntegration, getIntegrationByService } = useIntegrations()
  
  const [activeTab, setActiveTab] = useState<'leads' | 'integrations' | 'automation'>('leads')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Integration states
  const [integrationForms, setIntegrationForms] = useState({
    whatsapp: {
      apiKey: '',
      webhookUrl: '',
      phoneNumber: '',
    },
    email: {
      smtpHost: '',
      smtpPort: '587',
      username: '',
      password: '',
    },
    openai: {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      systemPrompt: 'Você é um assistente de vendas especializado em atendimento ao cliente. Seja cordial, profissional e sempre tente qualificar o lead.',
    }
  })

  const [testingIntegration, setTestingIntegration] = useState<string | null>(null)
  const [integrationStatus, setIntegrationStatus] = useState<{[key: string]: 'connected' | 'error' | 'disconnected'}>({})

  const [automationRules, setAutomationRules] = useState([
    {
      id: '1',
      name: 'Resposta Automática WhatsApp',
      trigger: 'new_whatsapp_message',
      enabled: true,
      conditions: {
        keywords: ['oi', 'olá', 'hello', 'preço', 'orçamento'],
        timeRange: { start: '09:00', end: '18:00' }
      },
      actions: {
        type: 'ai_response',
        useOpenAI: true,
        fallbackMessage: 'Obrigado pelo contato! Em breve retornaremos.'
      }
    },
    {
      id: '2',
      name: 'Follow-up Email Automático',
      trigger: 'lead_no_response',
      enabled: false,
      conditions: {
        daysWithoutResponse: 3,
        leadStatus: ['new', 'contacted']
      },
      actions: {
        type: 'send_email',
        template: 'follow_up_template',
        subject: 'Ainda tem interesse em nossos serviços?'
      }
    }
  ])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    company: '',
    value: '',
    notes: '',
    status: 'new' as const
  })

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-purple-100 text-purple-800',
    proposal: 'bg-orange-100 text-orange-800',
    negotiation: 'bg-indigo-100 text-indigo-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800'
  }

  const statusLabels = {
    new: 'Novo',
    contacted: 'Contatado',
    qualified: 'Qualificado',
    proposal: 'Proposta',
    negotiation: 'Negociação',
    won: 'Ganho',
    lost: 'Perdido'
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Load existing integrations
  React.useEffect(() => {
    const whatsappIntegration = getIntegrationByService('whatsapp')
    const emailIntegration = getIntegrationByService('email')
    const openaiIntegration = getIntegrationByService('openai')

    if (whatsappIntegration) {
      setIntegrationForms(prev => ({
        ...prev,
        whatsapp: {
          apiKey: whatsappIntegration.config.apiKey || '',
          webhookUrl: whatsappIntegration.config.webhookUrl || '',
          phoneNumber: whatsappIntegration.config.phoneNumber || '',
        }
      }))
      setIntegrationStatus(prev => ({ ...prev, whatsapp: 'connected' }))
    }

    if (emailIntegration) {
      setIntegrationForms(prev => ({
        ...prev,
        email: {
          smtpHost: emailIntegration.config.smtpHost || '',
          smtpPort: emailIntegration.config.smtpPort || '587',
          username: emailIntegration.config.username || '',
          password: emailIntegration.config.password || '',
        }
      }))
      setIntegrationStatus(prev => ({ ...prev, email: 'connected' }))
    }

    if (openaiIntegration) {
      setIntegrationForms(prev => ({
        ...prev,
        openai: {
          apiKey: openaiIntegration.config.apiKey || '',
          model: openaiIntegration.config.model || 'gpt-3.5-turbo',
          systemPrompt: openaiIntegration.config.systemPrompt || 'Você é um assistente de vendas especializado em atendimento ao cliente. Seja cordial, profissional e sempre tente qualificar o lead.',
        }
      }))
      setIntegrationStatus(prev => ({ ...prev, openai: 'connected' }))
    }
  }, [integrations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const leadData = {
      ...formData,
      value: formData.value ? parseFloat(formData.value) : null
    }

    if (selectedLead) {
      await updateLead(selectedLead.id, leadData)
    } else {
      await createLead(leadData)
    }

    setFormData({
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      company: '',
      value: '',
      notes: '',
      status: 'new'
    })
    setShowCreateForm(false)
    setSelectedLead(null)
  }

  const handleEdit = (lead: any) => {
    setSelectedLead(lead)
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      company: lead.company || '',
      value: lead.value?.toString() || '',
      notes: lead.notes || '',
      status: lead.status
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      await deleteLead(id)
    }
  }

  const handleBackToLanding = () => {
    window.location.href = '/'
  }

  const handleIntegrationSave = async (type: 'whatsapp' | 'email' | 'openai') => {
    const config = integrationForms[type]
    const result = await saveIntegration(type, config)
    
    if (result.success) {
      setIntegrationStatus(prev => ({ ...prev, [type]: 'connected' }))
      alert('Integração salva com sucesso!')
    } else {
      setIntegrationStatus(prev => ({ ...prev, [type]: 'error' }))
      alert(`Erro ao salvar integração: ${result.error}`)
    }
  }

  const handleTestIntegration = async (type: 'whatsapp' | 'email' | 'openai') => {
    setTestingIntegration(type)
    
    try {
      const result = await testIntegration(type)
      
      if (result.success) {
        setIntegrationStatus(prev => ({ ...prev, [type]: 'connected' }))
        alert('Teste realizado com sucesso!')
      } else {
        setIntegrationStatus(prev => ({ ...prev, [type]: 'error' }))
        alert(`Erro no teste: ${result.error}`)
      }
    } catch (error) {
      setIntegrationStatus(prev => ({ ...prev, [type]: 'error' }))
      alert('Erro ao testar integração')
    } finally {
      setTestingIntegration(null)
    }
  }

  const toggleAutomationRule = (ruleId: string) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ))
  }

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedLead(null)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      whatsapp: '',
                      company: '',
                      value: '',
                      notes: '',
                      status: 'new'
                    })
                  }}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold text-black">
                  {selectedLead ? 'Editar Lead' : 'Novo Lead'}
                </h1>
              </div>
              <button 
                onClick={handleBackToLanding}
                className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Voltar à página inicial"
              >
                <Home size={20} className="mr-2" />
                <span className="hidden sm:inline">Página Inicial</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Potencial (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setSelectedLead(null)
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {selectedLead ? 'Atualizar' : 'Criar'} Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <div className="bg-blue-600 text-white p-2 rounded-lg mr-3">
                  <Users size={20} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-black">CoreCRM</h1>
                  <p className="text-sm text-gray-600">Gestão de Leads e Clientes</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {activeTab === 'leads' && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus size={16} className="mr-2" />
                  Novo Lead
                </button>
              )}
              <button 
                onClick={handleBackToLanding}
                className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Voltar à página inicial"
              >
                <Home size={20} className="mr-2" />
                <span className="hidden sm:inline">Página Inicial</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('leads')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'leads'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Users size={16} className="mr-2" />
                  Leads
                </div>
              </button>
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'integrations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Settings size={16} className="mr-2" />
                  Integrações
                </div>
              </button>
              <button
                onClick={() => setActiveTab('automation')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'automation'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Bot size={16} className="mr-2" />
                  Automação IA
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Buscar leads..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos os Status</option>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-gray-600">
                  {filteredLeads.length} lead(s) encontrado(s)
                </div>
              </div>
            </div>

            {/* Leads List */}
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum lead encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro lead'
                  }
                </p>
                {!searchTerm && statusFilter === 'all' && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Criar Primeiro Lead
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[lead.status as keyof typeof statusColors]}`}>
                            {statusLabels[lead.status as keyof typeof statusLabels]}
                          </span>
                          {lead.value && (
                            <span className="flex items-center text-green-600 text-sm font-medium">
                              <DollarSign size={14} className="mr-1" />
                              R$ {lead.value.toLocaleString('pt-BR')}
                            </span>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          {lead.email && (
                            <div className="flex items-center text-gray-600">
                              <Mail size={16} className="mr-2" />
                              <span className="text-sm">{lead.email}</span>
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center text-gray-600">
                              <Phone size={16} className="mr-2" />
                              <span className="text-sm">{lead.phone}</span>
                            </div>
                          )}
                          {lead.whatsapp && (
                            <div className="flex items-center text-gray-600">
                              <MessageCircle size={16} className="mr-2" />
                              <span className="text-sm">{lead.whatsapp}</span>
                            </div>
                          )}
                          {lead.company && (
                            <div className="flex items-center text-gray-600">
                              <Star size={16} className="mr-2" />
                              <span className="text-sm">{lead.company}</span>
                            </div>
                          )}
                        </div>

                        {lead.notes && (
                          <p className="text-gray-600 text-sm mb-4">{lead.notes}</p>
                        )}

                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar size={12} className="mr-1" />
                          Criado em {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          {lead.last_contact && (
                            <>
                              <span className="mx-2">•</span>
                              Último contato: {new Date(lead.last_contact).toLocaleDateString('pt-BR')}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            {/* How It Works Button */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Configure suas integrações
                  </h3>
                  <p className="text-blue-700">
                    Conecte WhatsApp, Email e IA para automatizar seu atendimento
                  </p>
                </div>
                <button
                  onClick={() => setShowHowItWorks(true)}
                  className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <HelpCircle size={16} className="mr-2" />
                  Como funciona?
                </button>
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">WhatsApp Business API</h3>
                    <p className="text-gray-600">Conecte sua conta do WhatsApp Business</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    integrationStatus.whatsapp === 'connected' ? 'bg-green-500' : 
                    integrationStatus.whatsapp === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {integrationStatus.whatsapp === 'connected' ? 'Conectado' : 
                     integrationStatus.whatsapp === 'error' ? 'Erro' : 'Desconectado'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token da API
                  </label>
                  <input
                    type="password"
                    value={integrationForms.whatsapp.apiKey}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      whatsapp: { ...prev.whatsapp, apiKey: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Seu token da WhatsApp Business API"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={integrationForms.whatsapp.phoneNumber}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      whatsapp: { ...prev.whatsapp, phoneNumber: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="+55 11 99999-9999"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Webhook
                  </label>
                  <input
                    type="url"
                    value={integrationForms.whatsapp.webhookUrl}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      whatsapp: { ...prev.whatsapp, webhookUrl: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://sua-api.com/webhook/whatsapp"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => handleTestIntegration('whatsapp')}
                  disabled={testingIntegration === 'whatsapp'}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {testingIntegration === 'whatsapp' ? 'Testando...' : 'Testar Conexão'}
                </button>
                <button
                  onClick={() => handleIntegrationSave('whatsapp')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Salvar Configuração
                </button>
              </div>
            </div>

            {/* Email Integration */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Email SMTP</h3>
                    <p className="text-gray-600">Configure seu servidor de email</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    integrationStatus.email === 'connected' ? 'bg-green-500' : 
                    integrationStatus.email === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {integrationStatus.email === 'connected' ? 'Conectado' : 
                     integrationStatus.email === 'error' ? 'Erro' : 'Desconectado'}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Servidor SMTP
                  </label>
                  <input
                    type="text"
                    value={integrationForms.email.smtpHost}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpHost: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={integrationForms.email.smtpPort}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      email: { ...prev.email, smtpPort: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="587"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuário
                  </label>
                  <input
                    type="email"
                    value={integrationForms.email.username}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      email: { ...prev.email, username: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    value={integrationForms.email.password}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      email: { ...prev.email, password: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sua senha ou app password"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => handleTestIntegration('email')}
                  disabled={testingIntegration === 'email'}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {testingIntegration === 'email' ? 'Testando...' : 'Testar Conexão'}
                </button>
                <button
                  onClick={() => handleIntegrationSave('email')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar Configuração
                </button>
              </div>
            </div>

            {/* OpenAI Integration */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="bg-purple-500 text-white p-3 rounded-lg mr-4">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">OpenAI GPT</h3>
                    <p className="text-gray-600">Configure a IA para responder automaticamente</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    integrationStatus.openai === 'connected' ? 'bg-green-500' : 
                    integrationStatus.openai === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {integrationStatus.openai === 'connected' ? 'Conectado' : 
                     integrationStatus.openai === 'error' ? 'Erro' : 'Desconectado'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key da OpenAI
                    </label>
                    <input
                      type="password"
                      value={integrationForms.openai.apiKey}
                      onChange={(e) => setIntegrationForms(prev => ({
                        ...prev,
                        openai: { ...prev.openai, apiKey: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="sk-..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo
                    </label>
                    <select
                      value={integrationForms.openai.model}
                      onChange={(e) => setIntegrationForms(prev => ({
                        ...prev,
                        openai: { ...prev.openai, model: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt do Sistema
                  </label>
                  <textarea
                    value={integrationForms.openai.systemPrompt}
                    onChange={(e) => setIntegrationForms(prev => ({
                      ...prev,
                      openai: { ...prev.openai, systemPrompt: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Defina como a IA deve se comportar..."
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Este prompt define a personalidade e comportamento da IA ao responder leads
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => handleTestIntegration('openai')}
                  disabled={testingIntegration === 'openai'}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {testingIntegration === 'openai' ? 'Testando...' : 'Testar IA'}
                </button>
                <button
                  onClick={() => handleIntegrationSave('openai')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Salvar Configuração
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Regras de Automação</h3>
                  <p className="text-gray-600">Configure quando e como a IA deve responder</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                  <Plus size={16} className="mr-2" />
                  Nova Regra
                </button>
              </div>

              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <h4 className="font-medium text-gray-900">{rule.name}</h4>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {rule.trigger}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleAutomationRule(rule.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            rule.enabled 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {rule.enabled ? 'Ativo' : 'Inativo'}
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-2">
                      {rule.trigger === 'new_whatsapp_message' && (
                        <>
                          <p><strong>Palavras-chave:</strong> {rule.conditions.keywords.join(', ')}</p>
                          <p><strong>Horário:</strong> {rule.conditions.timeRange.start} às {rule.conditions.timeRange.end}</p>
                          <p><strong>Ação:</strong> Resposta automática com IA</p>
                        </>
                      )}
                      {rule.trigger === 'lead_no_response' && (
                        <>
                          <p><strong>Condição:</strong> {rule.conditions.daysWithoutResponse} dias sem resposta</p>
                          <p><strong>Status:</strong> {rule.conditions.leadStatus.join(', ')}</p>
                          <p><strong>Ação:</strong> Enviar email de follow-up</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* How It Works Modal */}
        {showHowItWorks && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Como funciona a automação?</h2>
                  <button
                    onClick={() => setShowHowItWorks(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* API Section */}
                  <div className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center mb-3">
                      <Key className="text-blue-500 mr-3" size={24} />
                      <h3 className="text-xl font-semibold text-gray-900">O que é uma API?</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      API (Application Programming Interface) é como um "garçom" que leva pedidos entre diferentes sistemas. 
                      No nosso caso, a API permite que o CoreCRM se comunique com WhatsApp, Email e OpenAI.
                    </p>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Exemplo prático:</h4>
                      <p className="text-blue-800 text-sm">
                        Quando um cliente envia uma mensagem no WhatsApp, a API do WhatsApp "avisa" o CoreCRM, 
                        que então pode processar a mensagem e responder automaticamente.
                      </p>
                    </div>
                  </div>

                  {/* Webhook Section */}
                  <div className="border-l-4 border-green-500 pl-6">
                    <div className="flex items-center mb-3">
                      <Webhook className="text-green-500 mr-3" size={24} />
                      <h3 className="text-xl font-semibold text-gray-900">O que são Webhooks?</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Webhooks são "notificações automáticas" que um sistema envia para outro quando algo acontece. 
                      É como um sino que toca toda vez que alguém entra na sua loja.
                    </p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Exemplo prático:</h4>
                      <p className="text-green-800 text-sm">
                        Quando alguém envia uma mensagem no WhatsApp, o webhook "toca o sino" e avisa o CoreCRM 
                        instantaneamente, permitindo resposta em tempo real.
                      </p>
                    </div>
                  </div>

                  {/* AI Integration Section */}
                  <div className="border-l-4 border-purple-500 pl-6">
                    <div className="flex items-center mb-3">
                      <Bot className="text-purple-500 mr-3" size={24} />
                      <h3 className="text-xl font-semibold text-gray-900">Como funciona a IA?</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      A IA (OpenAI GPT) é como ter um vendedor virtual 24/7. Ela lê as mensagens dos clientes 
                      e responde de forma inteligente, seguindo as instruções que você configurar.
                    </p>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="font-medium text-purple-900 mb-2">Exemplo prático:</h4>
                      <p className="text-purple-800 text-sm">
                        Cliente: "Quanto custa?" → IA: "Olá! Temos planos a partir de R$ 99. 
                        Gostaria de agendar uma conversa para conhecer melhor suas necessidades?"
                      </p>
                    </div>
                  </div>

                  {/* Flow Diagram */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Fluxo da Automação</h3>
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2">
                          <MessageSquare size={20} />
                        </div>
                        <p className="font-medium">Cliente envia mensagem</p>
                      </div>
                      <ArrowRight className="text-gray-400" size={20} />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                          <Webhook size={20} />
                        </div>
                        <p className="font-medium">Webhook notifica CoreCRM</p>
                      </div>
                      <ArrowRight className="text-gray-400" size={20} />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white mb-2">
                          <Bot size={20} />
                        </div>
                        <p className="font-medium">IA processa e responde</p>
                      </div>
                      <ArrowRight className="text-gray-400" size={20} />
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white mb-2">
                          <Send size={20} />
                        </div>
                        <p className="font-medium">Resposta enviada</p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Benefícios</h4>
                      <ul className="text-green-800 text-sm space-y-1">
                        <li>• Atendimento 24/7 automático</li>
                        <li>• Resposta instantânea aos leads</li>
                        <li>• Qualificação automática</li>
                        <li>• Redução de trabalho manual</li>
                      </ul>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">Requisitos</h4>
                      <ul className="text-yellow-800 text-sm space-y-1">
                        <li>• Conta WhatsApp Business</li>
                        <li>• API Key da OpenAI</li>
                        <li>• Configuração de webhooks</li>
                        <li>• Servidor para receber notificações</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setShowHowItWorks(false)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Entendi!
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}