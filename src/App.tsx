import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronRight, 
  Users, 
  Activity, 
  CheckSquare, 
  DollarSign,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Star,
  Zap,
  Shield,
  Headphones,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { PricingSection } from './components/PricingSection';
import { SuccessPage } from './components/SuccessPage';

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Remove the automatic redirect - let users stay on landing page if they want

  const saasProducts = [
    {
      name: 'CoreCRM',
      icon: Users,
      description: 'Gerencie seus clientes e leads com inteligência avançada',
      features: ['Automação de vendas', 'Analytics em tempo real', 'Integração omnichannel']
    },
    {
      name: 'CorePulse',
      icon: Activity,
      description: 'Monitore performance e KPIs com dashboards intuitivos',
      features: ['Métricas personalizadas', 'Alertas inteligentes', 'Relatórios automatizados']
    },
    {
      name: 'CoreTask',
      icon: CheckSquare,
      description: 'Organize projetos e equipes com metodologias ágeis',
      features: ['Kanban avançado', 'Time tracking', 'Colaboração em tempo real']
    },
    {
      name: 'CoreFinance',
      icon: DollarSign,
      description: 'Controle financeiro completo para seu negócio',
      features: ['Fluxo de caixa', 'Conciliação bancária', 'Relatórios fiscais']
    }
  ];

  const handleGetStarted = () => {
    if (user) {
      // If user is logged in, go to dashboard
      window.location.href = '/dashboard';
    } else {
      // If not logged in, show auth modal
      setShowAuthModal(true);
    }
  };

  const handleContactClick = () => {
    const footer = document.getElementById('contato');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close mobile menu if open
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-neumorphism' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl lg:text-3xl font-bold text-black">CoreFlow</span>
              </div>
            </div>
            
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#home" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium transition-colors">Início</a>
                <a href="#produtos" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium transition-colors">Produtos</a>
                <a href="#precos" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium transition-colors">Preços</a>
                <a href="#sobre" className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium transition-colors">Sobre</a>
                <button 
                  onClick={handleContactClick}
                  className="text-gray-700 hover:text-black px-3 py-2 text-sm font-medium transition-colors"
                >
                  Contato
                </button>
              </div>
            </nav>

            <div className="hidden md:block">
              <button 
                onClick={handleGetStarted}
                className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover"
              >
                {user ? 'Acessar Dashboard' : 'Começar Agora'}
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-black p-2 rounded-xl hover:shadow-neumorphism-inset transition-all duration-300"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-neumorphism">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#home" className="text-gray-700 hover:text-black block px-3 py-2 text-base font-medium rounded-xl hover:shadow-neumorphism-inset transition-all duration-300">Início</a>
              <a href="#produtos" className="text-gray-700 hover:text-black block px-3 py-2 text-base font-medium rounded-xl hover:shadow-neumorphism-inset transition-all duration-300">Produtos</a>
              <a href="#precos" className="text-gray-700 hover:text-black block px-3 py-2 text-base font-medium rounded-xl hover:shadow-neumorphism-inset transition-all duration-300">Preços</a>
              <a href="#sobre" className="text-gray-700 hover:text-black block px-3 py-2 text-base font-medium rounded-xl hover:shadow-neumorphism-inset transition-all duration-300">Sobre</a>
              <button 
                onClick={handleContactClick}
                className="text-gray-700 hover:text-black block px-3 py-2 text-base font-medium rounded-xl hover:shadow-neumorphism-inset transition-all duration-300 w-full text-left"
              >
                Contato
              </button>
              <div className="px-3 py-2">
                <button 
                  onClick={handleGetStarted}
                  className="w-full bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover"
                >
                  {user ? 'Acessar Dashboard' : 'Começar Agora'}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="pt-20 lg:pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
              Transforme seu
              <span className="block text-gray-600">negócio com</span>
              <span className="block bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">CoreFlow</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              A plataforma completa que unifica CRM, monitoramento, gestão de tarefas e controle financeiro 
              em uma única solução inteligente para empresas que buscam excelência.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={handleGetStarted}
                className="bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center"
              >
                {user ? 'Acessar Dashboard' : 'Começar Teste Grátis'}
                <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="produtos" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-4">
              Nossas Soluções
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Quatro produtos poderosos, uma única plataforma integrada para revolucionar 
              a gestão do seu negócio
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {saasProducts.map((product, index) => (
              <div 
                key={product.name}
                className="group bg-white p-8 rounded-3xl shadow-neumorphism hover:shadow-neumorphism-hover transition-all duration-300 hover:-translate-y-2"
              >
                <div className="bg-black text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-neumorphism">
                  <product.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{product.name}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-black rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* About Section */}
      <section id="sobre" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
                Por que escolher a CoreFlow?
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Somos mais que uma plataforma de software. Somos parceiros estratégicos 
                na transformação digital do seu negócio, oferecendo tecnologia de ponta 
                com suporte humano excepcional.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-neumorphism">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">Integração Total</h3>
                    <p className="text-gray-600">Todos os módulos trabalham em perfeita sincronia, eliminando silos de informação.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-neumorphism">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">Segurança Avançada</h3>
                    <p className="text-gray-600">Criptografia de ponta a ponta e compliance com as principais regulamentações.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-black text-white w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-neumorphism">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-2">Suporte Premium</h3>
                    <p className="text-gray-600">Equipe especializada disponível 24/7 para garantir o sucesso da sua operação.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-neumorphism">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                    <div className="w-8 h-8 bg-black rounded-xl mb-3 shadow-neumorphism"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                    <div className="w-8 h-8 bg-gray-700 rounded-xl mb-3 shadow-neumorphism"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                    <div className="w-8 h-8 bg-gray-600 rounded-xl mb-3 shadow-neumorphism"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl shadow-neumorphism-inset">
                    <div className="w-8 h-8 bg-gray-500 rounded-xl mb-3 shadow-neumorphism"></div>
                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center bg-gray-50 px-4 py-2 rounded-full shadow-neumorphism-inset">
                    <Star className="text-yellow-500 mr-2" size={16} />
                    <span className="text-sm font-medium text-gray-700">Plataforma Unificada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-2xl font-bold mb-4">CoreFlow</div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                A plataforma completa para transformar a gestão do seu negócio.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:shadow-neumorphism-inset">
                  <Linkedin size={20} />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors p-2 rounded-xl hover:shadow-neumorphism-inset">
                  <Twitter size={20} />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produtos</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CoreCRM</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CorePulse</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CoreTask</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">CoreFinance</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400">
                  <Mail size={16} className="mr-3" />
                  contato@coreflow.com
                </li>
                <li className="flex items-center text-gray-400">
                  <Phone size={16} className="mr-3" />
                  (11) 9999-9999
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin size={16} className="mr-3" />
                  São Paulo, Brasil
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CoreFlow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, hasActiveSubscription, subscriptionLoading, isFreeUser } = useAuth();

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Usuários com acesso gratuito sempre podem acessar
  if (isFreeUser()) {
    return <>{children}</>;
  }

  // Para outros usuários, verificar assinatura
  if (!hasActiveSubscription()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-neumorphism p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Assinatura Necessária
          </h1>
          
          <p className="text-gray-600 mb-8">
            Para acessar o dashboard do CoreFlow, você precisa de uma assinatura ativa. 
            Escolha um plano que melhor se adequa às suas necessidades.
          </p>

          <div className="space-y-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                // Force navigation to landing page with pricing section
                window.location.href = '/#precos';
              }}
              className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-colors font-medium inline-block text-center"
            >
              Ver Planos e Preços
            </a>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="text-yellow-600 mr-2" size={20} />
              <span className="text-yellow-800 font-medium">Teste Gratuito</span>
            </div>
            <p className="text-yellow-700 text-sm">
              Todos os planos incluem 7 dias de teste gratuito. Experimente sem compromisso!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;