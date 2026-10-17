import React from 'react';
import { useRadio } from '../context/RadioContext';
import bgVideo from '../assets/5102-182962908.mp4';
import broadcastGif from '../assets/images/ekkant-broadcast-8440_512.gif';
import {
  RadioTower,
  LogIn
} from 'lucide-react';

export const LivePlayer: React.FC = () => {
  const {
    setIsAuthModalOpen,
    setAuthDefaultTab,
  } = useRadio();

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 select-none px-4 sm:px-8 py-6 overflow-hidden bg-[#070b12]">
      {/* Background Video & Dark Overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-25 scale-105 filter blur-[0.5px]"
          src={bgVideo}
        />
        <div className="absolute inset-0 bg-[#070b12]/85 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto">
      
      {/* 1. Header: Brand on Left & Discreet Login Button on Top Right */}
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <RadioTower className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">RÁDIO WEB PRO</span>
        </div>

        {/* Discreet Top Right Login Button */}
        <button
          onClick={() => {
            setAuthDefaultTab('login');
            setIsAuthModalOpen(true);
          }}
          className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/80 border border-transparent hover:border-slate-800 transition-all flex items-center gap-1.5"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Entrar / Login</span>
        </button>
      </header>

      {/* 2. Center: Only the GIF & Volume Control */}
      <main className="flex-1 flex flex-col items-center justify-start pt-32 sm:pt-56 text-center max-w-lg mx-auto w-full space-y-6">
        
        {/* Center GIF */}
        <div className="relative flex items-center justify-center">
          <img
            src={broadcastGif}
            alt="Transmissão Ao Vivo"
            className="relative w-64 h-64 sm:w-80 sm:h-80 object-contain"
          />
        </div>


      </main>

      {/* 3. Footer: Subtle copyright */}
      <footer className="w-full text-center text-[11px] font-mono text-slate-600">
        RÁDIO WEB PRO · STREAMING AO VIVO
      </footer>

      </div>
    </div>
  );
};
