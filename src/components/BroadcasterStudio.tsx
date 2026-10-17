import React, { useState, useEffect, useRef } from 'react';
import { useRadio } from '../context/RadioContext';
import { globalAudioEngine } from '../utils/audioEngine';
import { VUMeter } from './VUMeter';
import { AudioWaveform } from './AudioWaveform';
import {
  Mic,
  MicOff,
  Radio,
  Sliders,
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  Users,
  Activity,
  Layers,
  Music,
  Plus,
  RefreshCw,
  CheckCircle,
  Clock,
  RadioTower,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
  Square,
  X,
  Search,
  Video,
  ListMusic,
  Trash2,
  Eye,
  Check,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { RadioTrack } from '../types';

export const BroadcasterStudio: React.FC = () => {
  const {
    user,
    station,
    updateStationStatus,
    tracks,
    addCustomTrack,
    currentAutomationTrack,
    playTrackAutomation,
    crossfadeToNextTrack,
    stopTrackAutomation,
    isAutomationPlaying,
    soundboard,
    triggerSoundboard,
    listenersCount,
    chatMessages,
    updateRequestStatus,
    setIsAuthModalOpen,
    isNewPodcastModalOpen,
    setIsNewPodcastModalOpen,
    addPodcast,
    startLiveBroadcastAudio,
    stopLiveBroadcastAudio,
  } = useRadio();

  // Studio State
  const [isMicLive, setIsMicLive] = useState(false);
  const [micGainVal, setMicGainVal] = useState(1.0);
  const [musicGainVal, setMusicGainVal] = useState(0.85);
  const [sfxGainVal, setSfxGainVal] = useState(0.9);
  const [masterGainVal, setMasterGainVal] = useState(0.95);
  const [autoDucking, setAutoDucking] = useState(true);
  const [crossfadeSec, setCrossfadeSec] = useState(4);
  const [activeStudioTab, setActiveStudioTab] = useState<'mixer' | 'playlist' | 'search' | 'soundboard' | 'requests'>('playlist');

  // Real-time VU Levels from AudioEngine
  const [vuLevels, setVuLevels] = useState({
    micPeak: 0,
    micRms: 0,
    musicPeak: 0,
    musicRms: 0,
    masterPeak: 0,
    masterRms: 0,
  });

  // Station Metadata quick edit modal
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editShow, setEditShow] = useState(station.currentShow);
  const [editBroadcaster, setEditBroadcaster] = useState(station.broadcaster);

  // Broadcast timer
  const [broadcastSeconds, setBroadcastSeconds] = useState(3600);

  // --- ONLINE MUSIC & VIDEO SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<RadioTrack[]>([]);
  const [directUrlInput, setDirectUrlInput] = useState('');

  // --- SEQUENTIAL PLAYLIST QUEUE (Tocar uma atrás da outra) ---
  const [playlistQueue, setPlaylistQueue] = useState<RadioTrack[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [activeVideoTrack, setActiveVideoTrack] = useState<RadioTrack | null>(null);

  // Fetch initial tracks from Supabase
  useEffect(() => {
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((data) => setPlaylistQueue(data))
      .catch((err) => console.error('Error fetching tracks:', err));
  }, []);

  // Hidden Audio & Video element refs
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);

  // Connect AudioEngine VU loop callback
  useEffect(() => {
    globalAudioEngine.onVuUpdate = (levels) => {
      setVuLevels(levels);
    };

    return () => {
      globalAudioEngine.onVuUpdate = undefined;
    };
  }, []);

  // Broadcast clock
  useEffect(() => {
    const timer = setInterval(() => {
      setBroadcastSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Connect media elements to Audio Engine for broadcast capture
  useEffect(() => {
    if (audioPlayerRef.current) {
      globalAudioEngine.connectMediaElement(audioPlayerRef.current);
    }
  }, []);

  useEffect(() => {
    if (videoPlayerRef.current) {
      globalAudioEngine.connectMediaElement(videoPlayerRef.current);
      videoPlayerRef.current.muted = false;
      videoPlayerRef.current.volume = Math.min(1, musicGainVal);
    }
  }, [activeVideoTrack, musicGainVal]);

  // Ensure AudioEngine initialized on interaction
  const initAudioOnInteraction = () => {
    globalAudioEngine.init();
    window.removeEventListener('click', initAudioOnInteraction);
    window.removeEventListener('keydown', initAudioOnInteraction);
    window.removeEventListener('touchstart', initAudioOnInteraction);
  };

  useEffect(() => {
    window.addEventListener('click', initAudioOnInteraction);
    window.addEventListener('keydown', initAudioOnInteraction);
    window.addEventListener('touchstart', initAudioOnInteraction);
    return () => {
      window.removeEventListener('click', initAudioOnInteraction);
      window.removeEventListener('keydown', initAudioOnInteraction);
      window.removeEventListener('touchstart', initAudioOnInteraction);
    };
  }, []);

  // Microphone toggle handler
  const handleToggleMic = async () => {
    globalAudioEngine.init();
    if (isMicLive) {
      globalAudioEngine.disableMicrophone();
      setIsMicLive(false);
    } else {
      const success = await globalAudioEngine.enableMicrophone();
      if (success) {
        setIsMicLive(true);
        startLiveBroadcastAudio();
      }
    }
  };

  // Sliders handlers
  const handleMicGainChange = (val: number) => {
    setMicGainVal(val);
    globalAudioEngine.setMicGain(val);
  };

  const handleMusicGainChange = (val: number) => {
    setMusicGainVal(val);
    globalAudioEngine.setMusicGain(val);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = Math.min(1, val);
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.volume = Math.min(1, val);
    }
  };

  const handleSfxGainChange = (val: number) => {
    setSfxGainVal(val);
    globalAudioEngine.setSfxGain(val);
  };

  const handleMasterGainChange = (val: number) => {
    setMasterGainVal(val);
    globalAudioEngine.setMasterGain(val);
  };

  const handleToggleAutoDucking = () => {
    const nextVal = !autoDucking;
    setAutoDucking(nextVal);
    globalAudioEngine.setAutoDucking(nextVal);
  };

  // --- SEARCH MUSIC DIRECTLY FROM THE INTERNET ---
  const handleSearchMusic = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.warn('Erro ao buscar músicas online:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Quick genre search preset
  const handleGenreQuickSearch = (genre: string) => {
    setSearchQuery(genre);
    handleSearchMusic(undefined, genre);
  };

  // Play a track from search immediately on air
  const handlePlaySearchTrackNow = (track: RadioTrack) => {
    // Add to top of queue and play
    const updatedQueue = [track, ...playlistQueue.filter((t) => t.id !== track.id)];
    setPlaylistQueue(updatedQueue);
    playQueueTrackAtIndex(0, updatedQueue);
  };

  // Add track from search to playlist queue
  const handleAddSearchTrackToQueue = (track: RadioTrack) => {
    setPlaylistQueue((prev) => [...prev, track]);
  };

  // Direct URL Play
  const handlePlayDirectUrl = () => {
    const url = directUrlInput.trim();
    if (!url) return;

    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    const isVideo = ytMatch || url.includes('.mp4') || url.includes('.webm') || url.includes('video');
    const ytId = ytMatch ? ytMatch[1] : undefined;

    const newTrack: RadioTrack = {
      id: 'direct_' + Date.now(),
      title: ytMatch ? `Vídeo do YouTube (${ytId})` : url.split('/').pop()?.split('?')[0] || 'Mídia da Internet',
      artist: ytMatch ? 'YouTube Canal' : 'Transmissão Online',
      album: 'Link Direto',
      duration: 210,
      genre: 'Streaming',
      bpm: 120,
      audioUrl: url,
      coverUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
      type: ytMatch ? 'youtube' : isVideo ? 'video' : 'audio',
      youtubeId: ytId,
    };

    const updatedQueue = [newTrack, ...playlistQueue];
    setPlaylistQueue(updatedQueue);
    playQueueTrackAtIndex(0, updatedQueue);
    setDirectUrlInput('');
  };

  // File upload for custom local tracks (audio or video from computer/phone)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4') || file.name.endsWith('.webm') || file.name.endsWith('.mov') || file.name.endsWith('.m4v');
    const newTrack: RadioTrack = {
      id: 'local_' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: isVideo ? 'Vídeo Local (PC/Celular)' : 'Arquivo Local (PC/Celular)',
      album: 'Upload Local',
      duration: 180,
      genre: isVideo ? 'Vídeo' : 'Personalizado',
      bpm: 120,
      audioUrl: objectUrl,
      coverUrl: isVideo
        ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=300&q=80'
        : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
      type: isVideo ? 'video' : 'audio',
      customFile: true,
    };

    const updatedQueue = [newTrack, ...playlistQueue];
    setPlaylistQueue(updatedQueue);
    playQueueTrackAtIndex(0, updatedQueue);
  };

  // --- PLAYLIST QUEUE PLAYBACK ENGINE ---
  const playQueueTrackAtIndex = (index: number, queue = playlistQueue) => {
    if (index < 0 || index >= queue.length) return;

    const track = queue[index];
    setCurrentQueueIndex(index);
    startLiveBroadcastAudio();

    // Check if video
    if (track.type === 'video' || track.type === 'youtube') {
      setActiveVideoTrack(track);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
      }
      if (track.type === 'video' && videoPlayerRef.current && track.audioUrl) {
        videoPlayerRef.current.src = track.audioUrl;
        videoPlayerRef.current.muted = false;
        videoPlayerRef.current.volume = Math.min(1, musicGainVal);
        globalAudioEngine.connectMediaElement(videoPlayerRef.current);
        videoPlayerRef.current.play().catch((e) => console.warn(e));
      }
    } else {
      // Audio track
      setActiveVideoTrack(null);
      if (videoPlayerRef.current) {
        videoPlayerRef.current.pause();
        videoPlayerRef.current.src = '';
      }
      if (track.audioUrl) {
        const audioEl = globalAudioEngine.playAudioUrl(track.audioUrl, track.title);
        if (audioEl) {
          audioEl.volume = Math.min(1, musicGainVal);
          audioEl.onended = handleTrackEnded;
        }
      }
    }

    playTrackAutomation(track);
  };

  // Auto-play next track when current ends
  const handleTrackEnded = () => {
    if (!autoplayNext) return;
    handlePlayNextInQueue();
  };

  const handlePlayNextInQueue = () => {
    if (playlistQueue.length === 0) return;
    const nextIdx = (currentQueueIndex + 1) % playlistQueue.length;
    playQueueTrackAtIndex(nextIdx);
  };

  const handleStopAll = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
      videoPlayerRef.current.currentTime = 0;
    }
    setActiveVideoTrack(null);
    stopTrackAutomation();
  };

  const handleRemoveFromQueue = (index: number) => {
    const updated = playlistQueue.filter((_, i) => i !== index);
    setPlaylistQueue(updated);
    if (currentQueueIndex === index) {
      if (updated.length > 0) {
        playQueueTrackAtIndex(Math.min(index, updated.length - 1), updated);
      } else {
        handleStopAll();
      }
    } else if (currentQueueIndex > index) {
      setCurrentQueueIndex((prev) => prev - 1);
    }
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    updateStationStatus({
      currentShow: editShow,
      broadcaster: editBroadcaster,
    });
    setIsEditingMetadata(false);
  };

  // Song requests from listeners
  const songRequests = chatMessages.filter((m) => m.type === 'song_request');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Hidden media players for audio capture & streaming */}
      <audio
        ref={audioPlayerRef}
        crossOrigin="anonymous"
        className="hidden"
        onEnded={handleTrackEnded}
      />

      {/* Studio Header Bar: Glowing ON AIR banner, timer, and master transmission status */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Illuminated ON AIR sign */}
        <div className="flex flex-col gap-3">
          <div
            className={`px-4 py-2 rounded-xl flex items-center gap-2.5 font-mono font-extrabold text-sm tracking-widest transition-all ${
              station.isOnAir
                ? 'bg-rose-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.8)] border border-rose-400 animate-pulse'
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            <span className={`w-3 h-3 rounded-full ${station.isOnAir ? 'bg-white' : 'bg-slate-600'}`} />
            <span>{station.isOnAir ? 'ON AIR · TRANSMITINDO' : 'OFF AIR · FORA DO AR'}</span>
          </div>
          <div className="w-48 h-10">
            <AudioWaveform isActive={station.isOnAir || isAutomationPlaying} height={40} />
          </div>
        </div>

        <div className="hidden sm:flex flex-col">
          <span className="text-xs font-semibold text-white">{station.currentShow}</span>
          <span className="text-[11px] text-slate-400">Radialista: {station.broadcaster}</span>
        </div>
        
        {/* Center: Live Broadcast Stats */}
        <div className="flex items-center gap-4 sm:gap-6 text-xs font-mono">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">TEMPO NO AR</span>
            <span className="text-sm font-bold text-sky-400 tabular-nums">{formatTimer(broadcastSeconds)}</span>
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">OUVINTES AO VIVO</span>
            <span className="text-sm font-bold text-emerald-400 tabular-nums flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {listenersCount}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-slate-800" />
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px]">TRANSMISSÃO</span>
            <span className="text-sm font-bold text-emerald-400">PCM 16-bit HD</span>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditingMetadata(!isEditingMetadata)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-sky-400" />
            <span>Editar Programa</span>
          </button>

          <button
            onClick={() => {
              const nextOnAir = !station.isOnAir;
              updateStationStatus({ isOnAir: nextOnAir });
              if (nextOnAir) {
                startLiveBroadcastAudio();
              } else {
                stopLiveBroadcastAudio();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              station.isOnAir
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
            }`}
          >
            {station.isOnAir ? 'Pausar Transmissão' : 'Iniciar No Ar'}
          </button>
        </div>
      </div>

      {/* Metadata Edit Drawer */}
      {isEditingMetadata && (
        <form onSubmit={handleSaveMetadata} className="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Programa</label>
            <input
              type="text"
              value={editShow}
              onChange={(e) => setEditShow(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Nome do Radialista</label>
            <input
              type="text"
              value={editBroadcaster}
              onChange={(e) => setEditBroadcaster(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs hover:bg-sky-400"
            >
              Salvar Alterações
            </button>
            <button
              type="button"
              onClick={() => setIsEditingMetadata(false)}
              className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Switcher Tabs */}
      <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
        <button
          onClick={() => setActiveStudioTab('playlist')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStudioTab === 'playlist' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ListMusic className="w-3.5 h-3.5" />
          <span>Playlist & Fila ({playlistQueue.length})</span>
        </button>
        <button
          onClick={() => setActiveStudioTab('search')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStudioTab === 'search' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Buscar na Internet & Vídeo</span>
        </button>
        <button
          onClick={() => setActiveStudioTab('mixer')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStudioTab === 'mixer' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Mesa de Som (VU Meter)</span>
        </button>
        <button
          onClick={() => setActiveStudioTab('soundboard')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeStudioTab === 'soundboard' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Vinhetas Rápidas</span>
        </button>
      </div>

      {/* --- VIDEO MONITOR (EXCLUSIVO PARA O RADIALISTA) --- */}
      {/* Ouvintes NÃO veem o vídeo; apenas escutam a música! */}
      {activeVideoTrack && (
        <div className="rounded-2xl bg-slate-900 border border-amber-500/50 p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider">
                Monitor de Vídeo do Radialista
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Exclusivo do Estúdio · Ouvintes recebem apenas o áudio</span>
              </span>
              <button
                onClick={() => setActiveVideoTrack(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                title="Minimizar Vídeo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Video Display for Broadcaster */}
          <div className="relative aspect-video max-h-[360px] mx-auto rounded-xl overflow-hidden bg-black border border-slate-800 shadow-2xl flex items-center justify-center">
            {activeVideoTrack.type === 'youtube' && activeVideoTrack.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoTrack.youtubeId}?autoplay=1&enablejsapi=1`}
                className="w-full h-full object-contain"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={activeVideoTrack.title}
              />
            ) : (
              <video
                ref={videoPlayerRef}
                src={activeVideoTrack.audioUrl}
                className="w-full h-full object-contain"
                controls
                autoPlay
                playsInline
                onEnded={handleTrackEnded}
              />
            )}
          </div>

          {/* Video Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-amber-400 block uppercase">VÍDEO EM REPRODUÇÃO NO AR</span>
              <span className="font-bold text-white truncate block text-sm">{activeVideoTrack.title}</span>
              <span className="text-slate-400 text-xs truncate block">{activeVideoTrack.artist}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStopAll}
                className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/40 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Parar Reprodução</span>
              </button>
              <button
                onClick={handlePlayNextInQueue}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-md"
              >
                <SkipForward className="w-4 h-4" />
                <span>Próxima Música</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Microphone & Mixer */}
        <div className={`lg:col-span-5 space-y-6 ${activeStudioTab === 'mixer' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Microphone Locution Card */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-sky-400" />
                <span>Microfone do Radialista</span>
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isMicLive ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-400'
              }`}>
                {isMicLive ? 'NO AR' : 'MUDO'}
              </span>
            </div>

            {/* Tactile Big Mic Button */}
            <div className="flex flex-col items-center justify-center gap-3 py-2">
              <button
                onClick={handleToggleMic}
                className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center transition-all shadow-2xl active:scale-95 ${
                  isMicLive
                    ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_35px_rgba(225,29,72,0.8)] animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
                }`}
              >
                {isMicLive ? <Mic className="w-10 h-10" /> : <MicOff className="w-10 h-10" />}
                <span className="text-[11px] font-mono font-bold mt-1.5">
                  {isMicLive ? 'MIC NO AR' : 'FALAR NO AR'}
                </span>
              </button>

              <span className="text-xs text-slate-400 text-center max-w-xs">
                {isMicLive
                  ? '🔴 Você está falando ao vivo! Os ouvintes ouvem sua voz com baixa latência.'
                  : 'Clique no botão acima para ligar o microfone e falar no ar.'}
              </span>
            </div>

            {/* Microphone VU Meter */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>NÍVEL DO MICROFONE</span>
                <span className="text-sky-400 tabular-nums">
                  {isMicLive ? `${Math.round(vuLevels.micRms * 100)}%` : 'MUTADO'}
                </span>
              </div>
              <VUMeter level={isMicLive ? vuLevels.micRms : 0} peak={isMicLive ? vuLevels.micPeak : 0} channels="single" compact />
            </div>

            {/* Mic Gain Slider */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>GANHO DO MICROFONE</span>
                  <span className="text-sky-400 font-bold">{Math.round((micGainVal / 2.5) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2.5"
                  step="0.05"
                  value={micGainVal}
                  onChange={(e) => handleMicGainChange(parseFloat(e.target.value))}
                  className="studio-fader w-full"
                />
              </div>

              {/* Auto-Ducking Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-slate-200 block">Auto-Ducking Inteligente</span>
                  <span className="text-[11px] text-slate-400">Abaixa a música automaticamente ao falar</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoDucking}
                  onChange={handleToggleAutoDucking}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Master Output Waveform */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3 shadow-xl">
            <span className="text-xs font-mono text-slate-400 block font-bold">ESPECTRO DE ÁUDIO TRANSMITIDO</span>
            <AudioWaveform isActive={station.isOnAir && (isMicLive || isAutomationPlaying)} height={60} mode="wave" />
          </div>

        </div>

        {/* RIGHT COLUMN: Search, Queue Playlist & Decks */}
        <div className={`lg:col-span-7 space-y-6 ${activeStudioTab === 'mixer' ? 'hidden lg:block' : 'block'}`}>
          
          {/* SEARCH INTERNET MUSIC & VIDEOS */}
          <div className={`rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl ${
            activeStudioTab === 'search' || activeStudioTab === 'playlist' ? 'block' : 'hidden'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Buscar Música Direto na Internet</h2>
              </div>
              <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20">
                Streaming Online
              </span>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearchMusic} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nome da música, artista ou cole link do YouTube..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-sky-500 placeholder-slate-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all active:scale-95 shrink-0 flex items-center gap-1.5"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Buscar</span>
              </button>
            </form>

            {/* Quick Genre Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Sertanejo', 'Pop Hits', 'Gospel', 'Rock Clássico', 'Eletrônica', 'MPB', 'Lo-Fi / Chill'].map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreQuickSearch(genre)}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/50 text-[11px] text-slate-300 font-medium transition-all"
                >
                  {genre}
                </button>
              ))}
            </div>

            {/* Direct URL input option */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  placeholder="Ou cole link direto do YouTube ou arquivo MP4/MP3..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handlePlayDirectUrl}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
                >
                  ▶ Tocar Agora
                </button>
              </div>
            </div>

            {/* Search Results Dropdown/Box */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border-t border-slate-800 pt-3">
                <span className="text-[11px] font-mono text-slate-400 block">RESULTADOS ENCONTRADOS NA INTERNET:</span>
                <div className="space-y-1.5">
                  {searchResults.map((item) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-sky-500/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.coverUrl}
                          alt="Capa"
                          className="w-10 h-10 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div className="truncate">
                          <span className="font-bold text-white truncate block">{item.title}</span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {item.artist} · {item.album}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handlePlaySearchTrackNow(item)}
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Tocar</span>
                        </button>
                        <button
                          onClick={() => handleAddSearchTrackToQueue(item)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs border border-slate-700"
                        >
                          + Fila
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEQUENTIAL PLAYLIST QUEUE (Tocar uma atrás da outra automaticamente) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide">Fila de Reprodução Sequencial</h2>
                  <span className="text-[10px] font-mono text-slate-400">Toca uma música atrás da outra sem parar</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Autoplay Toggle */}
                <button
                  onClick={() => setAutoplayNext(!autoplayNext)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                    autoplayNext
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Tocar automaticamente a próxima música quando a atual terminar"
                >
                  {autoplayNext ? '✓ Autoplay: Ligado' : 'Autoplay: Desligado'}
                </button>

                <button
                  onClick={handlePlayNextInQueue}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-slate-950 border border-sky-500/30 text-xs font-bold transition-all flex items-center gap-1"
                  title="Pular para a próxima música"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Pular</span>
                </button>

                <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1 transition-colors" title="Enviar arquivo de áudio ou vídeo do computador ou celular">
                  <Plus className="w-3.5 h-3.5 text-sky-400" />
                  <span>Arquivo (PC/Cel)</span>
                  <input type="file" accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.mp4,.webm,.mov,.m4v" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Currently Playing Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 flex items-center justify-between gap-4 shadow-inner">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    playlistQueue[currentQueueIndex]?.coverUrl ||
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80'
                  }
                  alt="Capa"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                />
                <div className="truncate">
                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block">
                    {isAutomationPlaying ? 'TOCANDO AGORA NO AR' : 'EM PAUSA'}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">
                    {playlistQueue[currentQueueIndex]?.title || station.currentTrack.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate">
                    {playlistQueue[currentQueueIndex]?.artist || station.currentTrack.artist}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (isAutomationPlaying) {
                      handleStopAll();
                    } else {
                      playQueueTrackAtIndex(currentQueueIndex);
                    }
                  }}
                  className="w-10 h-10 rounded-xl bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  {isAutomationPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={handleStopAll}
                  title="Parar reprodução"
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
              </div>
            </div>

            {/* Volume of Music Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>VOLUME DA MÚSICA NO AR</span>
                <span className="text-sky-400 font-bold">{Math.round((musicGainVal / 1.5) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={musicGainVal}
                onChange={(e) => handleMusicGainChange(parseFloat(e.target.value))}
                className="studio-fader w-full"
              />
            </div>

            {/* Up Next List */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>PRÓXIMAS DA FILA (Ordem Sequencial):</span>
                <span>{playlistQueue.length} na lista</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {playlistQueue.map((track, i) => {
                  const isCurrent = i === currentQueueIndex;
                  return (
                    <div
                      key={track.id + '_' + i}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all ${
                        isCurrent
                          ? 'bg-sky-950/50 border-sky-500/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`font-mono text-[11px] ${isCurrent ? 'text-sky-400 font-bold' : 'text-slate-500'} w-4`}>
                          {i + 1}
                        </span>
                        <img
                          src={track.coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80'}
                          alt="Capa"
                          className="w-8 h-8 rounded object-cover border border-slate-800 shrink-0"
                        />
                        <div className="truncate">
                          <span className={`font-bold ${isCurrent ? 'text-sky-300' : 'text-white'} truncate block`}>
                            {track.title}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">{track.artist}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isCurrent && isAutomationPlaying && (
                          <span className="text-[10px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/20">
                            NO AR
                          </span>
                        )}
                        <button
                          onClick={() => playQueueTrackAtIndex(i)}
                          className={`p-1.5 rounded-lg ${
                            isCurrent && isAutomationPlaying
                              ? 'bg-sky-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {isCurrent && isAutomationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDeleteTrack(track)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remover da lista e excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module: Deck de Vinhetas e Efeitos (Soundboard) */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white tracking-wide">Deck de Vinhetas Rápidas</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Disparo Instantâneo</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {soundboard.map((fx, idx) => (
                <button
                  key={fx.id}
                  onClick={() => triggerSoundboard(fx.id)}
                  className="group relative p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-sky-500 hover:bg-slate-800/80 transition-all flex flex-col items-center justify-between min-h-[85px] text-center active:scale-95 shadow-md"
                >
                  <div className="flex justify-between w-full text-[10px] font-mono text-slate-500 group-hover:text-slate-300">
                    <span className="w-4 h-4 rounded bg-slate-900 border border-slate-800 flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="uppercase text-[9px]">{fx.category}</span>
                  </div>

                  <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300 transition-colors line-clamp-2">
                    {fx.shortLabel}
                  </span>

                  <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-sky-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
