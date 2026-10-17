import React from 'react';
import { useRadio } from '../context/RadioContext';
import { RadioTower, Mic2, Headphones, LogOut, Lock, Disc3 } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, activeTab, setActiveTab, setIsAuthModalOpen, setAuthDefaultTab, station } = useRadio();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => setActiveTab('listener')}
          className="flex items-center gap-2.5 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
            <RadioTower className="w-5 h-5 text-slate-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap group-hover:text-sky-400 transition-colors">
              RÁDIO WEB PRO
            </span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400">
              98.7 FM DIGITAL
            </span>
          </div>
        </button>

        {/* Center: Live Station Status */}
        {station.isOnAir && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-mono">NO AR · AO VIVO</span>
          </div>
        )}

        {/* Zone 3: Primary Action / Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user?.role === 'admin' ? (
            <div className="flex items-center gap-2">
              {activeTab === 'studio' ? (
                <button
                  onClick={() => setActiveTab('listener')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-xs font-semibold hover:bg-sky-500/30 transition-all"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Modo Ouvinte</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('studio')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold hover:bg-rose-500/30 transition-all"
                >
                  <Mic2 className="w-3.5 h-3.5" />
                  <span>Painel do Estúdio</span>
                </button>
              )}

              <button
                onClick={logout}
                title="Sair da Conta"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthDefaultTab('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/50 text-slate-200 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
            >
              <Mic2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Painel do Radialista</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
