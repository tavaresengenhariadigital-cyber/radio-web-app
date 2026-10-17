import React, { useState, useEffect } from 'react';
import { useRadio } from '../context/RadioContext';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  MapPin,
  ShieldAlert,
  Sparkles,
  Radio,
  CheckCircle2,
  Music,
  ArrowRight
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authDefaultTab,
    login,
    register,
    setActiveTab,
  } = useRadio();

  const [tab, setTab] = useState<'radialista' | 'register' | 'login'>('radialista');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync with authDefaultTab when opened
  useEffect(() => {
    if (isAuthModalOpen) {
      if (authDefaultTab === 'radialista') {
        setTab('radialista');
      } else if (authDefaultTab === 'register') {
        setTab('register');
      } else {
        setTab('login');
      }
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isAuthModalOpen, authDefaultTab]);

  if (!isAuthModalOpen) return null;

  // 1-Click Fast Login for the Broadcaster (Evandro)
  const handleRadialistaDirectLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    const res = await login('evandro230655@gmail.com', '230655');
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Acesso autorizado! Abrindo o Estúdio do Radialista...');
      setTimeout(() => {
        setActiveTab('studio');
        setIsAuthModalOpen(false);
      }, 700);
    } else {
      setErrorMsg(res.error || 'Erro ao autenticar radialista.');
    }
  };

  // Login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Credenciais inválidas.');
    } else {
      setSuccessMsg('Login realizado com sucesso!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
        // If logged in as admin/broadcaster, switch to studio
        if (email.toLowerCase().includes('evandro')) {
          setActiveTab('studio');
        }
      }, 600);
    }
  };

  // Listener registration form submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await register(name, email, password, whatsapp, city);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao realizar cadastro.');
    } else {
      setSuccessMsg('Cadastro realizado com sucesso! Agora você já pode pedir músicas no ar!');
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 1000);
    }
  };

  // Quick listener login demo
  const handleListenerDirectLogin = async () => {
    setLoading(true);
    const res = await login('ouvinte@radioweb.pro', 'ouvinte123');
    setLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    } else {
      setErrorMsg('Erro ao entrar como ouvinte.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5 sm:p-7 text-slate-100 overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5 pr-8">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              {tab === 'radialista' ? (
                <Radio className="w-5 h-5 text-sky-400" />
              ) : tab === 'register' ? (
                <Music className="w-5 h-5 text-emerald-400" />
              ) : (
                <Lock className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                {tab === 'radialista'
                  ? 'Acesso ao Estúdio do Radialista'
                  : tab === 'register'
                  ? 'Cadastro de Ouvinte (Pedir Música)'
                  : 'Login de Ouvinte'}
              </h2>
              <span className="text-[11px] font-mono text-slate-400 block">
                {tab === 'radialista'
                  ? 'Credenciais para entrar no ar e controlar a mesa de som'
                  : tab === 'register'
                  ? 'Cadastre-se para pedir sua música favorita e mandar alô'
                  : 'Acesse sua conta para interagir com a rádio'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800 gap-1">
          <button
            type="button"
            onClick={() => {
              setTab('radialista');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'radialista'
                ? 'bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Radialista</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Cadastrar Ouvinte</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              tab === 'login'
                ? 'bg-slate-800 text-white shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: RADIALISTA (CREDENCIAIS & 1-CLICK) */}
        {tab === 'radialista' && (
          <div className="space-y-4 animate-in fade-in">
            
            {/* Illuminated Credentials Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-sky-950/40 to-slate-950/90 border border-sky-500/40 shadow-inner space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  Credenciais Oficiais do Radialista (Evandro)
                </span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-500/30 text-[10px] text-sky-300 font-mono font-bold">
                  ADMIN / PRO
                </span>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-800/80">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="text-white font-bold tracking-wide">evandro230655@gmail.com</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-slate-400">Senha:</span>
                  <span className="text-amber-400 font-bold tracking-widest text-sm">230655</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300">
                Clique abaixo para autenticar instantaneamente e abrir o Estúdio de Transmissão (Mesa de Som, VU Meter e Automação de Músicas):
              </p>

              <button
                type="button"
                disabled={loading}
                onClick={handleRadialistaDirectLogin}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-400 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-95 cursor-pointer"
              >
                {loading ? (
                  <span>Acessando o Estúdio...</span>
                ) : (
                  <>
                    <Radio className="w-4 h-4" />
                    <span>⚡ ENTRAR DIRETO NO ESTÚDIO DO RADIALISTA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">
                Você é um ouvinte querendo pedir música?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-emerald-400 hover:text-emerald-300 font-bold underline underline-offset-2 ml-1 cursor-pointer"
                >
                  Fazer Cadastro de Ouvinte →
                </button>
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: CADASTRO DE OUVINTE (PEDIR MÚSICA) */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-in fade-in">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <Music className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                Cadastre-se rapidamente para enviar seus pedidos de músicas e recados direto para o radialista Evandro!
              </span>
            </div>

            {/* Nome Completo */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                />
              </div>
            </div>

            {/* WhatsApp & Cidade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp / Celular</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cidade / Estado</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: São Paulo - SP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Criar Senha *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crie uma senha de acesso"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Salvando cadastro...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONCLUIR CADASTRO & LIBERAR PEDIDO DE MÚSICA</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 text-xs text-slate-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-sky-400 hover:text-sky-300 underline font-bold"
              >
                Faça login aqui
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: LOGIN OUVINTE */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 animate-in fade-in">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {loading ? 'Entrando...' : 'Entrar na Conta de Ouvinte'}
            </button>

            {/* Demo Fast Login for Tester */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Conta Ouvinte de Teste:</span>
              <button
                type="button"
                onClick={handleListenerDirectLogin}
                className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
              >
                Entrar como Carlos (VIP)
              </button>
            </div>

            <div className="text-center pt-2 text-xs text-slate-400">
              Não tem cadastro?{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="text-emerald-400 hover:text-emerald-300 underline font-bold"
              >
                Cadastre-se para pedir música
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
