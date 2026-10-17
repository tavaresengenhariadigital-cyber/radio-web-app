import React, { useState } from 'react';
import { useRadio } from '../context/RadioContext';
import { X, Lock, Mail, User as UserIcon, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authDefaultTab, login, register, setActiveTab } = useRadio();

  const [tab, setTab] = useState<'login' | 'register'>(authDefaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Credenciais inválidas.');
    } else {
      setActiveTab('studio');
      setIsAuthModalOpen(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await register(name, email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Erro ao registrar.');
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const loginAsAdminDirect = async () => {
    setEmail('evandro230655@gmail.com');
    setPassword('230655');
    setLoading(true);
    const res = await login('evandro230655@gmail.com', '230655');
    setLoading(false);
    if (res.success) {
      setActiveTab('studio');
      setIsAuthModalOpen(false);
    } else {
      setErrorMsg(res.error || 'Erro ao entrar.');
    }
  };

  const loginAsListenerDirect = async () => {
    setEmail('ouvinte@radioweb.pro');
    setPassword('ouvinte123');
    setLoading(true);
    const res = await login('ouvinte@radioweb.pro', 'ouvinte123');
    setLoading(false);
    if (res.success) {
      setIsAuthModalOpen(false);
    } else {
      setErrorMsg(res.error || 'Erro ao entrar.');
    }
  };

  const fillAdminCredentials = () => {
    setEmail('evandro230655@gmail.com');
    setPassword('230655');
    setTab('login');
    setErrorMsg(null);
  };

  const fillListenerCredentials = () => {
    setEmail('ouvinte@radioweb.pro');
    setPassword('ouvinte123');
    setTab('login');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {tab === 'login' ? 'Login & Credenciais' : 'Criar Conta de Ouvinte'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {tab === 'login'
              ? 'Acesse o Painel do Radialista para transmitir ou a Conta de Ouvinte VIP.'
              : 'Cadastre-se gratuitamente para interagir no chat ao vivo e pedir músicas.'}
          </p>
        </div>

        {/* 1-Click Fast Login Card */}
        <div className="mb-5 p-4 rounded-xl bg-slate-950/90 border border-sky-500/40 shadow-inner space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              Credenciais do Radialista (Evandro)
            </span>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">E-mail:</span>
              <span className="text-white font-bold">evandro230655@gmail.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Senha:</span>
              <span className="text-white font-bold">230655</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              disabled={loading}
              onClick={loginAsAdminDirect}
              className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)] active:scale-95 cursor-pointer"
            >
              <span>⚡ Entrar Direto no Estúdio</span>
            </button>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Preencher Campos
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              tab === 'login'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
              tab === 'register'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Cadastrar
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Nome Completo</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-mono text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-mono text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Processando...' : tab === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta'}
          </button>
        </form>

        {/* Demo Listener shortcut */}
        {tab === 'login' && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Conta Ouvinte VIP:</span>
            <button
              type="button"
              onClick={loginAsListenerDirect}
              className="text-xs font-semibold text-sky-400 hover:text-sky-300 underline underline-offset-2 cursor-pointer"
            >
              Entrar como Carlos (Ouvinte VIP)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
