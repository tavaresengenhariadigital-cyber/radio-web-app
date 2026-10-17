import React, { useState, useEffect, useRef } from 'react';
import { useRadio } from '../context/RadioContext';
import { globalAudioEngine } from '../utils/audioEngine';
import bgVideo from '../assets/5102-182962908.mp4';
import broadcastGif from '../assets/images/ekkant-broadcast-8440_512.gif';
import {
  RadioTower,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Users,
  Music,
  Send,
  Radio,
  Sliders,
  LogIn,
  LogOut,
  Key,
  ShieldCheck,
  Sparkles,
  Mic,
  Disc3,
  X
} from 'lucide-react';

export const LivePlayer: React.FC = () => {
  const {
    user,
    station,
    isPlayingLive,
    togglePlayLive,
    liveVolume,
    setLiveVolume,
    listenersCount,
    setIsAuthModalOpen,
    setAuthDefaultTab,
    setActiveTab,
    sendSongRequest,
    logout,
  } = useRadio();

  const [hasInteracted, setHasInteracted] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestSong, setRequestSong] = useState('');
  const [requestArtist, setRequestArtist] = useState('');
  const [requestSent, setRequestSent] = useState(false);

  // Hidden audio element for high-stability direct browser playback
  const listenerAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync audio element with station.currentTrack and isPlayingLive
  useEffect(() => {
    const audio = listenerAudioRef.current;
    if (!audio) return;

    audio.volume = Math.min(1, Math.max(0, liveVolume));

    if (isPlayingLive && station.currentTrack?.audioUrl) {
      if (audio.src !== station.currentTrack.audioUrl) {
        audio.src = station.currentTrack.audioUrl;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setHasInteracted(true))
          .catch((err) => {
            console.warn('Autoplay blocked by browser policy, user interaction required:', err);
          });
      }
    } else {
      audio.pause();
    }
  }, [isPlayingLive, station.currentTrack?.audioUrl, liveVolume]);

  const handleTogglePlay = () => {
    setHasInteracted(true);
    globalAudioEngine.init();
    togglePlayLive();

    const audio = listenerAudioRef.current;
    if (audio) {
      if (!isPlayingLive && station.currentTrack?.audioUrl) {
        if (audio.src !== station.currentTrack.audioUrl) {
          audio.src = station.currentTrack.audioUrl;
        }
        audio.play().catch((e) => console.warn(e));
      }
    }
  };

  const handleVolumeChange = (v: number) => {
    setLiveVolume(v);
    if (listenerAudioRef.current) {
      listenerAudioRef.current.volume = v;
    }
  };

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestSong.trim()) return;
    sendSongRequest(requestSong.trim(), requestArtist.trim() || 'Artista não especificado');
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setIsRequestModalOpen(false);
      setRequestSong('');
      setRequestArtist('');
    }, 2000);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between text-slate-100 select-none px-4 sm:px-8 py-5 overflow-hidden bg-[#070b12]">
      {/* Background Video & Dark Overlay */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-20 scale-105 filter blur-[1px]"
          src={bgVideo}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/80 via-[#070b12]/90 to-[#070b12]" />
      </div>

      {/* Hidden Listener Audio Element */}
      <audio
        ref={listenerAudioRef}
        preload="auto"
        className="hidden"
        onError={() => {
          console.warn('Listener audio fallback on error');
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col justify-between w-full max-w-4xl mx-auto space-y-6">
        
        {/* 1. Header: Brand on Left & Status / Auth on Right */}
        <header className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <RadioTower className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-white block">RÁDIO WEB PRO</span>
              <span className="text-[10px] font-mono tracking-wider text-slate-400 block">TRANSMISSÃO DIGITAL HD</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live On Air status badge */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                station.isOnAir
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${station.isOnAir ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              <span>{station.isOnAir ? 'NO AR · AO VIVO' : 'OFF AIR'}</span>
            </div>

            {/* Prominent Login / Credentials Button */}
            {user?.role === 'admin' ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('studio')}
                  className="text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.4)] active:scale-95 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Estúdio do Radialista</span>
                </button>
                <button
                  onClick={logout}
                  title="Sair da Conta"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-300 hidden sm:inline">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthDefaultTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 rounded-xl border border-sky-400/50 hover:border-sky-300 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.3)] active:scale-95 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-amber-300" />
                <span>Login / Credenciais</span>
              </button>
            )}
          </div>
        </header>

        {/* Quick Credentials Info Strip (Always visible for easy access) */}
        {!user && (
          <div className="w-full bg-slate-950/80 border border-sky-500/30 rounded-xl px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-mono text-amber-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Acesso do Radialista:
              </span>
              <span className="font-mono text-slate-400">
                <strong className="text-slate-200">evandro230655@gmail.com</strong> / Senha: <strong className="text-slate-200">230655</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setAuthDefaultTab('login');
                setIsAuthModalOpen(true);
              }}
              className="text-xs font-bold text-sky-400 hover:text-sky-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Entrar com Credenciais →</span>
            </button>
          </div>
        )}

        {/* 2. Center: Broadcasting GIF & Now Playing Player Console */}
        <main className="flex-1 flex flex-col items-center justify-center text-center max-w-xl mx-auto w-full space-y-6 my-auto">
          
          {/* Autoplay unlock notice if sound blocked */}
          {!hasInteracted && !isPlayingLive && (
            <button
              onClick={handleTogglePlay}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-2 animate-bounce cursor-pointer shadow-lg"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Clique aqui ou no botão PLAY para ouvir a transmissão ao vivo!</span>
            </button>
          )}

          {/* Center GIF with sound wave aesthetic */}
          <div className="relative flex items-center justify-center">
            <div className={`absolute -inset-4 rounded-full transition-opacity duration-700 blur-2xl ${
              isPlayingLive ? 'bg-sky-500/20 opacity-100' : 'opacity-0'
            }`} />
            <img
              src={broadcastGif}
              alt="Transmissão Ao Vivo"
              className="relative w-52 h-52 sm:w-64 sm:h-64 object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Now Playing Information Card */}
          <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
            
            <div className="flex items-center gap-4 text-left">
              <div className="relative shrink-0">
                <img
                  src={
                    station.currentTrack?.coverUrl ||
                    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
                  }
                  alt="Capa da Música"
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-700/80 shadow-md ${
                    isPlayingLive ? 'ring-2 ring-sky-500/50 ring-offset-2 ring-offset-slate-900' : ''
                  }`}
                />
                {isPlayingLive && (
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                    {isPlayingLive ? 'TOCANDO AGORA' : 'RÁDIO EM ESPERA'}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate">
                    {station.currentShow}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white truncate leading-tight">
                  {station.currentTrack?.title || 'Midnight City Groove'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 truncate">
                  {station.currentTrack?.artist || 'Synthwave Collective'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Radialista: <span className="text-slate-400 font-medium">{station.broadcaster}</span>
                </p>
              </div>
            </div>

            {/* Audio Equalizer Animated Bars */}
            <div className="h-6 flex items-center justify-center gap-1 px-4 bg-slate-950/70 rounded-xl border border-slate-800/80">
              {[40, 70, 30, 90, 55, 80, 45, 60, 95, 35, 75, 50, 85, 30, 65, 90, 40, 70].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-300 ${
                    isPlayingLive
                      ? 'bg-gradient-to-t from-sky-500 to-cyan-300 animate-pulse'
                      : 'bg-slate-800 h-1.5'
                  }`}
                  style={{
                    height: isPlayingLive ? `${Math.max(15, (h * (0.6 + (i % 3) * 0.2)))}%` : '4px',
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>

            {/* Primary Live Player Controls */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80">
              
              {/* Play / Pause Button */}
              <button
                onClick={handleTogglePlay}
                className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-xl active:scale-95 cursor-pointer ${
                  isPlayingLive
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_25px_rgba(56,189,248,0.4)] animate-pulse'
                }`}
              >
                {isPlayingLive ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>PAUSAR RÁDIO</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>OUVIR AO VIVO</span>
                  </>
                )}
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2.5 flex-1 max-w-[200px]">
                <button
                  onClick={() => handleVolumeChange(liveVolume === 0 ? 0.8 : 0)}
                  className="text-slate-400 hover:text-white transition-colors"
                  title={liveVolume === 0 ? 'Desmutar' : 'Mutar'}
                >
                  {liveVolume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : liveVolume < 0.5 ? (
                    <Volume1 className="w-4 h-4 text-sky-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-sky-400" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={liveVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="studio-fader w-full"
                />
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                  {Math.round(liveVolume * 100)}%
                </span>
              </div>

              {/* Request Song Button */}
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Music className="w-3.5 h-3.5 text-sky-400" />
                <span>Pedir Música</span>
              </button>
            </div>

            {/* Audio telemetry info */}
            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300 font-bold">{listenersCount}</span> ouvintes sintonizados
              </span>
              <span>HD 320 kbps · Áudio Digital</span>
            </div>

          </div>

        </main>

        {/* 3. Footer */}
        <footer className="w-full text-center text-[11px] font-mono text-slate-500">
          RÁDIO WEB PRO · ESTÚDIO DE TRANSMISSÃO & STREAMING AO VIVO
        </footer>

      </div>

      {/* Song Request Modal for Listeners */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Music className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pedir Música no Ar</h3>
                <p className="text-xs text-slate-400">Envie seu pedido diretamente para o radialista {station.broadcaster}</p>
              </div>
            </div>

            {requestSent ? (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center space-y-1">
                <p className="text-sm">✓ Pedido Enviado com Sucesso!</p>
                <p className="text-slate-300 font-normal">O radialista recebeu seu pedido no estúdio e tocará em breve.</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome da Música</label>
                  <input
                    type="text"
                    required
                    value={requestSong}
                    onChange={(e) => setRequestSong(e.target.value)}
                    placeholder="Ex: Sujeito (Ao Vivo)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Artista / Banda</label>
                  <input
                    type="text"
                    value={requestArtist}
                    onChange={(e) => setRequestArtist(e.target.value)}
                    placeholder="Ex: Gusttavo Lima"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Pedido</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
