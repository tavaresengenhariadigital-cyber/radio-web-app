import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, StationStatus, PodcastEpisode, RadioTrack, SoundboardEffect, ChatMessage, ScheduleItem } from '../types';
import { globalAudioEngine } from '../utils/audioEngine';

interface RadioContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  station: StationStatus;
  updateStationStatus: (updated: Partial<StationStatus>) => Promise<void>;

  activeTab: 'listener' | 'podcasts' | 'schedule' | 'studio' | 'about';
  setActiveTab: (tab: 'listener' | 'podcasts' | 'schedule' | 'studio' | 'about') => void;

  // Live Radio Playback
  isPlayingLive: boolean;
  togglePlayLive: () => void;
  liveVolume: number;
  setLiveVolume: (v: number) => void;
  audioQuality: string;
  setAudioQuality: (q: string) => void;

  // Podcast Player State
  activePodcast: PodcastEpisode | null;
  isPodcastPlaying: boolean;
  podcastProgress: number;
  podcastDuration: number;
  podcastPlaybackRate: number;
  playPodcast: (episode: PodcastEpisode) => void;
  pausePodcast: () => void;
  resumePodcast: () => void;
  seekPodcast: (seconds: number) => void;
  setPodcastPlaybackRate: (speed: number) => void;
  closePodcastPlayer: () => void;

  // Podcasts Data
  podcasts: PodcastEpisode[];
  addPodcast: (podcastData: Partial<PodcastEpisode>) => Promise<boolean>;
  deletePodcast: (id: string) => Promise<boolean>;

  // Broadcaster automation & decks
  tracks: RadioTrack[];
  addCustomTrack: (track: RadioTrack) => void;
  currentAutomationTrack: RadioTrack | null;
  playTrackAutomation: (track: RadioTrack) => void;
  crossfadeToNextTrack: () => void;
  stopTrackAutomation: () => void;
  isAutomationPlaying: boolean;
  startLiveBroadcastAudio: () => void;
  stopLiveBroadcastAudio: () => void;

  // Soundboard
  soundboard: SoundboardEffect[];
  triggerSoundboard: (effectId: string) => void;

  // Live Chat & Song requests
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  sendSongRequest: (songTitle: string, artist: string, comment?: string) => void;
  updateRequestStatus: (messageId: string, status: 'pending' | 'played') => void;

  // Telemetry & WS
  wsConnected: boolean;
  listenersCount: number;

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authDefaultTab: 'login' | 'register';
  setAuthDefaultTab: (tab: 'login' | 'register') => void;
  isNewPodcastModalOpen: boolean;
  setIsNewPodcastModalOpen: (open: boolean) => void;
}

const defaultStation: StationStatus = {
  isOnAir: true,
  currentShow: 'Manhã Interativa & Conexões',
  broadcaster: 'Evandro',
  currentTrack: {
    title: 'Midnight City Groove',
    artist: 'Synthwave Collective',
    album: 'Neon Echoes',
    duration: 215,
    elapsed: 48,
    genre: 'Synthwave',
  },
  listenersCount: 1,
  bitrate: '320 kbps (HD)',
  audioQuality: 'Stereo 48kHz Digital',
  streamHealth: 'Excelente',
};

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('radioweb_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'listener' | 'podcasts' | 'schedule' | 'studio' | 'about'>('listener');
  const [station, setStation] = useState<StationStatus>(defaultStation);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [soundboard, setSoundboard] = useState<SoundboardEffect[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [listenersCount, setListenersCount] = useState<number>(1);
  const [wsConnected, setWsConnected] = useState<boolean>(false);

  // Live Playback
  const [isPlayingLive, setIsPlayingLive] = useState<boolean>(true);
  const [liveVolume, setLiveVolume] = useState<number>(0.85);
  const [audioQuality, setAudioQuality] = useState<string>('320 kbps (HD)');

  // Auto-play on mount
  useEffect(() => {
    globalAudioEngine.init();
    globalAudioEngine.setMasterGain(liveVolume);
    if (station.currentTrack?.audioUrl) {
      globalAudioEngine.playAudioUrl(station.currentTrack.audioUrl, station.currentTrack.title);
    }

    const handleFirstGesture = () => {
      // Robustly resume AudioContext if it was suspended by browser policy
      globalAudioEngine.init();
      
      if (station.currentTrack?.audioUrl) {
        globalAudioEngine.playAudioUrl(station.currentTrack.audioUrl, station.currentTrack.title);
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Podcast Player
  const [activePodcast, setActivePodcast] = useState<PodcastEpisode | null>(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState<boolean>(false);
  const [podcastProgress, setPodcastProgress] = useState<number>(0);
  const [podcastDuration, setPodcastDuration] = useState<number>(0);
  const [podcastPlaybackRate, setPodcastPlaybackRate] = useState<number>(1.0);
  const podcastIntervalRef = useRef<any>(null);

  // Automation
  const [currentAutomationTrack, setCurrentAutomationTrack] = useState<RadioTrack | null>(null);
  const [isAutomationPlaying, setIsAutomationPlaying] = useState<boolean>(false);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register'>('login');
  const [isNewPodcastModalOpen, setIsNewPodcastModalOpen] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);

  // 1. Establish WebSocket Connection
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        // 1. Live binary PCM audio stream from Broadcaster microphone/music
        if (event.data instanceof ArrayBuffer) {
          globalAudioEngine.playIncomingPcmChunk(event.data);
          return;
        }

        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'init') {
            if (msg.data.station) setStation(msg.data.station);
            if (msg.data.podcasts) setPodcasts(msg.data.podcasts);
            if (msg.data.tracks) setTracks(msg.data.tracks);
            if (msg.data.soundboard) setSoundboard(msg.data.soundboard);
            if (msg.data.chatMessages) setChatMessages(msg.data.chatMessages);
            if (msg.data.station?.listenersCount) setListenersCount(msg.data.station.listenersCount);
          } else if (msg.type === 'listeners_count') {
            setListenersCount(msg.count);
          } else if (msg.type === 'station_updated') {
            setStation(msg.station);
          } else if (msg.type === 'new_chat_message') {
            setChatMessages((prev) => [...prev, msg.message]);
          } else if (msg.type === 'sfx_played') {
            // Trigger client synth playback for live sound effect
            globalAudioEngine.playSoundEffect(msg.effectId);
          } else if (msg.type === 'request_status_changed') {
            setChatMessages((prev) =>
              prev.map((m) => (m.id === msg.messageId ? { ...m, status: msg.status } : m))
            );
          } else if (msg.type === 'station_media_play') {
            if (msg.track) {
              setStation((prev) => ({
                ...prev,
                currentTrack: {
                  title: msg.track.title || 'Música Online',
                  artist: msg.track.artist || 'Web Stream',
                  album: msg.track.album || 'Rádio Web Pro',
                  duration: msg.track.duration || 210,
                  elapsed: 0,
                  genre: msg.track.genre || 'Hit',
                  audioUrl: msg.track.audioUrl,
                },
              }));
              if (msg.track.audioUrl) {
                setIsPlayingLive(true);
                globalAudioEngine.playAudioUrl(msg.track.audioUrl, msg.track.title);
              }
            }
          } else if (msg.type === 'station_media_stop') {
            globalAudioEngine.stopRadioAutomation();
            setStation((prev) => ({
              ...prev,
              currentTrack: {
                title: 'Estúdio em Pausa',
                artist: prev.broadcaster,
                album: 'Ao Vivo',
                duration: 0,
                elapsed: 0,
                genre: 'Voz / Locução',
              },
            }));
          } else if (msg.type === 'podcast_added') {
            setPodcasts((prev) => [msg.podcast, ...prev]);
          } else if (msg.type === 'podcast_deleted') {
            setPodcasts((prev) => prev.filter((p) => p.id !== msg.podcastId));
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWs, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Sync Live Volume with AudioEngine
  useEffect(() => {
    globalAudioEngine.setMasterGain(liveVolume);
  }, [liveVolume]);

  // Podcast progress timer simulation (or real audio element if provided)
  useEffect(() => {
    if (isPodcastPlaying && activePodcast) {
      podcastIntervalRef.current = setInterval(() => {
        setPodcastProgress((prev) => {
          if (prev >= podcastDuration && podcastDuration > 0) {
            setIsPodcastPlaying(false);
            return 0;
          }
          return prev + 1 * podcastPlaybackRate;
        });
      }, 1000);
    } else {
      if (podcastIntervalRef.current) {
        clearInterval(podcastIntervalRef.current);
        podcastIntervalRef.current = null;
      }
    }

    return () => {
      if (podcastIntervalRef.current) clearInterval(podcastIntervalRef.current);
    };
  }, [isPodcastPlaying, activePodcast, podcastDuration, podcastPlaybackRate]);

  // Auth Functions
  const login = async (email: string, password: string) => {
    const cleanEmail = email.toLowerCase().trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('radioweb_user', JSON.stringify(data));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      // If backend returns 404 (e.g. on Netlify static hosting)
      if (res.status === 404) {
        if (cleanEmail === 'evandro230655@gmail.com' && password === '230655') {
          const adminUser: User = {
            id: 'usr_admin_1',
            email: 'evandro230655@gmail.com',
            name: 'Evandro (Radialista Principal)',
            role: 'admin',
          };
          setUser(adminUser);
          localStorage.setItem('radioweb_user', JSON.stringify(adminUser));
          setIsAuthModalOpen(false);
          return { success: true };
        }
      }

      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Credenciais inválidas.' };
    } catch {
      // Fallback for static hosting environments like Netlify where Node.js backend is not running
      if (cleanEmail === 'evandro230655@gmail.com' && password === '230655') {
        const adminUser: User = {
          id: 'usr_admin_1',
          email: 'evandro230655@gmail.com',
          name: 'Evandro (Radialista Principal)',
          role: 'admin',
        };
        setUser(adminUser);
        localStorage.setItem('radioweb_user', JSON.stringify(adminUser));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      if (cleanEmail === 'ouvinte@radioweb.pro' && password === 'ouvinte123') {
        const listenerUser: User = {
          id: 'usr_listener_1',
          email: 'ouvinte@radioweb.pro',
          name: 'Carlos Silva (Ouvinte)',
          role: 'listener',
        };
        setUser(listenerUser);
        localStorage.setItem('radioweb_user', JSON.stringify(listenerUser));
        setIsAuthModalOpen(false);
        return { success: true };
      }

      return { success: false, error: 'Credenciais inválidas.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: cleanEmail, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('radioweb_user', JSON.stringify(data));
        setIsAuthModalOpen(false);
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      return { success: false, error: data.error || 'Erro ao criar conta.' };
    } catch {
      // Offline / Netlify fallback
      const newUser: User = {
        id: 'usr_' + Date.now(),
        email: cleanEmail,
        name: name.trim(),
        role: 'listener',
      };
      setUser(newUser);
      localStorage.setItem('radioweb_user', JSON.stringify(newUser));
      setIsAuthModalOpen(false);
      return { success: true };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('radioweb_user');
    if (activeTab === 'studio') {
      setActiveTab('listener');
    }
  };

  // Live Radio Playback (Apenas recebe o áudio transmitido do estúdio)
  const togglePlayLive = () => {
    if (isPlayingLive) {
      setIsPlayingLive(false);
      globalAudioEngine.stopRadioAutomation();
    } else {
      // Pause podcast if playing
      if (isPodcastPlaying) {
        setIsPodcastPlaying(false);
      }
      globalAudioEngine.init();
      globalAudioEngine.setMasterGain(liveVolume);
      setIsPlayingLive(true);
      if (station.currentTrack?.audioUrl) {
        globalAudioEngine.playAudioUrl(station.currentTrack.audioUrl, station.currentTrack.title);
      }
    }
  };

  // Station Update
  const updateStationStatus = async (updated: Partial<StationStatus>) => {
    const newStation = { ...station, ...updated };
    setStation(newStation);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'station_update',
          data: updated,
        })
      );
    }
  };

  // Podcasts
  const playPodcast = (episode: PodcastEpisode) => {
    if (isPlayingLive) {
      setIsPlayingLive(false);
      globalAudioEngine.stopRadioAutomation();
    }
    setActivePodcast(episode);
    setPodcastDuration(episode.durationSeconds || 1800);
    setPodcastProgress(0);
    setIsPodcastPlaying(true);
  };

  const pausePodcast = () => setIsPodcastPlaying(false);
  const resumePodcast = () => setIsPodcastPlaying(true);
  const seekPodcast = (seconds: number) => {
    setPodcastProgress(Math.max(0, Math.min(podcastDuration, seconds)));
  };
  const closePodcastPlayer = () => {
    setIsPodcastPlaying(false);
    setActivePodcast(null);
    setPodcastProgress(0);
  };

  const addPodcast = async (podcastData: Partial<PodcastEpisode>) => {
    try {
      const res = await fetch('/api/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(podcastData),
      });
      if (res.ok) {
        const created = await res.json();
        setPodcasts((prev) => [created, ...prev]);
        setIsNewPodcastModalOpen(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deletePodcast = async (id: string) => {
    try {
      const res = await fetch(`/api/podcasts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPodcasts((prev) => prev.filter((p) => p.id !== id));
        if (activePodcast?.id === id) {
          closePodcastPlayer();
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Studio Automation Deck
  const playTrackAutomation = (track: RadioTrack) => {
    setCurrentAutomationTrack(track);
    setIsAutomationPlaying(true);
    globalAudioEngine.playRadioAutomation(track.title, track.audioUrl);
    updateStationStatus({
      currentTrack: {
        title: track.title,
        artist: track.artist,
        album: track.album,
        duration: track.duration,
        elapsed: 0,
        genre: track.genre,
      },
    });
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'station_media_play',
          track: {
            title: track.title,
            artist: track.artist,
            album: track.album,
            duration: track.duration,
            genre: track.genre,
            audioUrl: track.audioUrl,
            coverUrl: track.coverUrl,
            type: track.type || 'audio',
            youtubeId: track.youtubeId,
          },
        })
      );
    }
  };

  const crossfadeToNextTrack = () => {
    if (!tracks.length) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentAutomationTrack?.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    const nextTrack = tracks[nextIndex];
    setCurrentAutomationTrack(nextTrack);
    globalAudioEngine.crossfadeTo(nextTrack.title, nextTrack.audioUrl, 4);
    updateStationStatus({
      currentTrack: {
        title: nextTrack.title,
        artist: nextTrack.artist,
        album: nextTrack.album,
        duration: nextTrack.duration,
        elapsed: 0,
        genre: nextTrack.genre,
      },
    });
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'station_media_play',
          track: {
            title: nextTrack.title,
            artist: nextTrack.artist,
            album: nextTrack.album,
            duration: nextTrack.duration,
            genre: nextTrack.genre,
            audioUrl: nextTrack.audioUrl,
            coverUrl: nextTrack.coverUrl,
            type: nextTrack.type || 'audio',
            youtubeId: nextTrack.youtubeId,
          },
        })
      );
    }
  };

  const stopTrackAutomation = () => {
    setIsAutomationPlaying(false);
    globalAudioEngine.stopRadioAutomation();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'station_media_stop',
        })
      );
    }
  };

  const addCustomTrack = (track: RadioTrack) => {
    setTracks((prev) => [track, ...prev]);
  };

  // Soundboard Trigger
  const triggerSoundboard = (effectId: string) => {
    globalAudioEngine.playSoundEffect(effectId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'sfx_trigger',
          effectId,
        })
      );
    }
  };

  // Live Stream Broadcasting (Broadcaster -> All Listeners)
  const startLiveBroadcastAudio = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      globalAudioEngine.startBroadcastingStream(wsRef.current);
    }
  };

  const stopLiveBroadcastAudio = () => {
    globalAudioEngine.stopBroadcastingStream();
  };

  // Chat & Song Requests
  const sendChatMessage = (text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'chat_message',
        senderName: user ? user.name : 'Ouvinte Visitante',
        senderEmail: user ? user.email : '',
        senderRole: user ? user.role : 'listener',
        text: text.trim(),
        msgType: 'chat',
      })
    );
  };

  const sendSongRequest = (songTitle: string, artist: string, comment?: string) => {
    if (!songTitle.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(
      JSON.stringify({
        type: 'chat_message',
        senderName: user ? user.name : 'Ouvinte Visitante',
        senderEmail: user ? user.email : '',
        senderRole: user ? user.role : 'listener',
        text: comment || `Pediu a música: ${songTitle} - ${artist}`,
        msgType: 'song_request',
        songDetails: { songTitle, artist },
      })
    );
  };

  const updateRequestStatus = (messageId: string, status: 'pending' | 'played') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'request_status_update',
          messageId,
          status,
        })
      );
    }
  };

  return (
    <RadioContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        station,
        updateStationStatus,
        activeTab,
        setActiveTab,
        isPlayingLive,
        togglePlayLive,
        liveVolume,
        setLiveVolume,
        audioQuality,
        setAudioQuality,
        activePodcast,
        isPodcastPlaying,
        podcastProgress,
        podcastDuration,
        podcastPlaybackRate,
        playPodcast,
        pausePodcast,
        resumePodcast,
        seekPodcast,
        setPodcastPlaybackRate,
        closePodcastPlayer,
        podcasts,
        addPodcast,
        deletePodcast,
        tracks,
        addCustomTrack,
        currentAutomationTrack,
        playTrackAutomation,
        crossfadeToNextTrack,
        stopTrackAutomation,
        isAutomationPlaying,
        startLiveBroadcastAudio,
        stopLiveBroadcastAudio,
        soundboard,
        triggerSoundboard,
        chatMessages,
        sendChatMessage,
        sendSongRequest,
        updateRequestStatus,
        wsConnected,
        listenersCount,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authDefaultTab,
        setAuthDefaultTab,
        isNewPodcastModalOpen,
        setIsNewPodcastModalOpen,
      }}
    >
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (!context) throw new Error('useRadio must be used within a RadioProvider');
  return context;
};
