export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'broadcaster' | 'listener';
  avatarUrl?: string;
}

export interface StationStatus {
  isOnAir: boolean;
  currentShow: string;
  broadcaster: string;
  currentTrack: {
    title: string;
    artist: string;
    album: string;
    duration: number; // in seconds
    elapsed: number;
    genre: string;
    audioUrl?: string;
  };
  listenersCount: number;
  bitrate: string;
  audioQuality: string;
  streamHealth: 'Excelente' | 'Boa' | 'Instável';
  startedAt?: number;
}

export interface PodcastEpisode {
  id: string;
  podcastTitle: string;
  title: string;
  description: string;
  host: string;
  category: 'Tecnologia' | 'Música & Cultura' | 'Jornalismo' | 'Empreendedorismo' | 'Entretenimento';
  coverUrl: string;
  audioUrl: string;
  duration: string;
  durationSeconds: number;
  publishedAt: string;
  plays: number;
}

export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  genre: string;
  bpm: number;
  audioUrl?: string;
  coverUrl?: string;
  type?: 'audio' | 'video' | 'youtube';
  youtubeId?: string;
  customFile?: boolean;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderRole: 'admin' | 'broadcaster' | 'listener';
  text: string;
  timestamp: string;
  type: 'chat' | 'song_request';
  songDetails?: {
    songTitle: string;
    artist: string;
  };
  status?: 'pending' | 'played';
}

export interface SoundboardEffect {
  id: string;
  title: string;
  shortLabel: string;
  type: 'synth' | 'audio';
  category: 'vinheta' | 'efeito' | 'voz' | 'transicao';
  hotkey: string;
  color: string;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: string;
  timeSlot: string;
  showTitle: string;
  host: string;
  genre: string;
  description: string;
  isCurrent?: boolean;
}
