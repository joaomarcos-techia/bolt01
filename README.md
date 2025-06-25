# CoreFlow - Plataforma Integrada de Gestão

Uma plataforma completa que unifica CRM, monitoramento, gestão de tarefas e controle financeiro em uma única solução inteligente para empresas que buscam excelência.

## 🚀 Funcionalidades

### CoreCRM
- Gestão completa de leads e clientes
- Automação de vendas e follow-ups
- Integração com WhatsApp e Email
- Sistema de tags e categorização
- Funil de vendas visual

### CoreTask
- Gestão de tarefas e projetos
- Kanban board interativo
- Sistema de prioridades
- Colaboração em equipe
- Controle de prazos

### CoreFinance
- Controle financeiro completo
- Gestão de contas e categorias
- Relatórios financeiros
- Fluxo de caixa
- Integração com vendas

### CorePulse
- Insights inteligentes com IA
- Automações personalizadas
- Análise de dados em tempo real
- Otimização de processos
- Alertas inteligentes

## 💳 Planos e Preços

### Plano Starter - R$ 29/mês
- Até 100 leads no CoreCRM
- Até 50 tarefas no CoreTask
- Controle financeiro básico
- 3 automações simples
- Suporte por email
- 1 usuário

### Plano Profissional - R$ 79/mês ⭐ Mais Popular
- Leads ilimitados no CoreCRM
- Tarefas ilimitadas no CoreTask
- CoreFinance completo
- Até 20 automações
- Insights básicos do CorePulse
- Integrações WhatsApp e Email
- Relatórios avançados
- Suporte prioritário
- Até 5 usuários

### Plano Enterprise - R$ 199/mês
- Tudo do Profissional
- Automações ilimitadas
- CorePulse com IA avançada
- Todas as integrações disponíveis
- API personalizada completa
- Relatórios personalizados
- Suporte 24/7 dedicado
- Usuários ilimitados
- Treinamento personalizado
- Backup e segurança avançada

## 🔧 Configuração do Stripe

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima

# Stripe (para Edge Functions)
STRIPE_SECRET_KEY=sk_test_... ou sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Produtos Configurados no Stripe

Os produtos já estão configurados no código:

- **Starter**: R$ 29/mês (price_1RbQFSQTHGGahVKsS0UEd8FL)
- **Profissional**: R$ 79/mês (price_1RbQG6QTHGGahVKsXWCcnfoL)
- **Enterprise**: R$ 199/mês (price_1RbQGWQTHGGahVKsta4XI5jF)

### 3. Configurar Webhooks no Stripe

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/webhooks)
2. Clique em "Add endpoint"
3. URL do endpoint: `https://seu-projeto.supabase.co/functions/v1/stripe-webhook`
4. Selecione os eventos:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 4. Testar a Integração

Use os cartões de teste do Stripe:
- **Sucesso**: `4242 4242 4242 4242`
- **Recusado**: `4000 0000 0000 0002`
- **Fundos insuficientes**: `4000 0000 0000 9995`

## 🛠️ Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📊 Funcionalidades Implementadas

✅ **Sistema de Assinatura Completo**
- Checkout automático com Stripe
- Gerenciamento de assinaturas
- Controle de acesso baseado em plano
- Página de sucesso pós-pagamento

✅ **Autenticação e Perfis**
- Sistema de login/cadastro
- Perfis de usuário com foto
- Controle de sessão

✅ **Dashboard Integrado**
- Visão geral de todos os módulos
- Estatísticas em tempo real
- Acesso rápido às funcionalidades

✅ **Segurança**
- Row Level Security (RLS)
- Políticas de acesso granulares
- Validação de dados

## 🔐 Segurança

- Todas as tabelas utilizam RLS (Row Level Security)
- Usuários só acessam seus próprios dados
- Validação de webhooks do Stripe
- Criptografia de dados sensíveis

## 📱 Responsividade

- Design totalmente responsivo
- Otimizado para mobile, tablet e desktop
- Interface moderna com Neumorphism
- Experiência de usuário premium

## 🎯 Próximos Passos

1. **Explore cada módulo** - Teste todas as funcionalidades
2. **Configure integrações** - WhatsApp, Email, etc.
3. **Personalize automações** - Use o CorePulse
4. **Analise relatórios** - Acompanhe métricas importantes

## 📞 Suporte

- Email: suporte@coreflow.com
- Documentação: [docs.coreflow.com](https://docs.coreflow.com)
- Status: [status.coreflow.com](https://status.coreflow.com)

---

**💡 Dica:** Todos os planos incluem 7 dias de teste gratuito. Experimente sem compromisso!