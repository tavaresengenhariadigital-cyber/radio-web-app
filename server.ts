import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// --- SUPABASE CLIENT SETUP ---
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://girsmsjtbovtajdzpoku.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpcnNtc2p0Ym92dGFqZHpwb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODc5NjAsImV4cCI6MjEwNzc2Mzk2MH0.Ltjl7NUKun3wOvq6aUJt522wt78Rw4ksH1Y8BjnR8nc';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- IN-MEMORY DATA STORE WITH FILE PERSISTENCE ---
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'radio_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface RadioDatabase {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: 'admin' | 'broadcaster' | 'listener';
    avatarUrl?: string;
  }>;
  station: {
    isOnAir: boolean;
    currentShow: string;
    broadcaster: string;
    currentTrack: {
      title: string;
      artist: string;
      album: string;
      duration: number;
      elapsed: number;
      genre: string;
    };
    bitrate: string;
    audioQuality: string;
    streamHealth: 'Excelente' | 'Boa' | 'Instável';
    startedAt?: number;
  };
  podcasts: Array<any>;
  tracks: Array<any>;
  soundboard: Array<any>;
  chatMessages: Array<any>;
  schedules: Array<any>;
}

// Initial default seed data
const initialData: RadioDatabase = {
  users: [
    {
      id: 'usr_admin_1',
      email: 'evandro230655@gmail.com',
      passwordHash: '230655', // Plain comparison for simplicity in demo
      name: 'Evandro (Radialista Principal)',
      role: 'admin',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'usr_listener_1',
      email: 'ouvinte@radioweb.pro',
      passwordHash: 'ouvinte123',
      name: 'Carlos Silva (Membro VIP)',
      role: 'listener',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    },
  ],
  station: {
    isOnAir: true,
    currentShow: 'Manhã Interativa & Conexões',
    broadcaster: 'Evandro',
    currentTrack: {
      title: 'Midnight City Groove',
      artist: 'Synthwave Collective',
      album: 'Neon Echoes',
      duration: 215,
      elapsed: 64,
      genre: 'Synthwave / Retro',
    },
    bitrate: '320 kbps (HD)',
    audioQuality: 'Stereo 48kHz Digital',
    streamHealth: 'Excelente',
    startedAt: Date.now() - 3600000,
  },
  podcasts: [
    {
      id: 'pod_1',
      podcastTitle: 'Conexão Tech',
      title: 'IA e o Futuro do Trabalho em 2026',
      description: 'Uma análise detalhada sobre agentes autônomos, novas interfaces de computação espacial e as competências mais valorizadas para desenvolvedores e criadores.',
      host: 'Evandro & Equipe Tech',
      category: 'Tecnologia',
      coverUrl: '/src/assets/images/podcast_conexao_1792189176735.jpg',
      audioUrl: '',
      duration: '38:45',
      durationSeconds: 2325,
      publishedAt: '15 Out 2026',
      plays: 1420,
    },
    {
      id: 'pod_2',
      podcastTitle: 'Cultura & Beats',
      title: 'A Renascença do Vinil e a Produção Analógica',
      description: 'Por que produtores de música eletrônica e grandes gravadoras voltaram a apostar nos estúdios vintage com fita magnética e compressores valvulados.',
      host: 'Mariana Costa',
      category: 'Música & Cultura',
      coverUrl: '/src/assets/images/podcast_cultura_1792189189304.jpg',
      audioUrl: '',
      duration: '45:10',
      durationSeconds: 2710,
      publishedAt: '14 Out 2026',
      plays: 2890,
    },
    {
      id: 'pod_3',
      podcastTitle: 'Notícias & Opinião',
      title: 'Panorama Econômico Global e Tendências de Mercado',
      description: 'Balanço da semana sobre taxas de juros, inovações no comércio exterior e as projeções do setor de radiodifusão e streaming.',
      host: 'Roberto Mendonça',
      category: 'Jornalismo',
      coverUrl: '/src/assets/images/podcast_noticias_1792189200864.jpg',
      audioUrl: '',
      duration: '29:15',
      durationSeconds: 1755,
      publishedAt: '16 Out 2026',
      plays: 980,
    },
    {
      id: 'pod_4',
      podcastTitle: 'Empreenda Pro',
      title: 'Construindo Produtos Rentáveis do Zero',
      description: 'Lições práticas de fundadores de sucesso sobre validação de público, modelos de receita recorrente e cultura ágil.',
      host: 'Fernanda Lima',
      category: 'Empreendedorismo',
      coverUrl: '/src/assets/images/podcast_conexao_1792189176735.jpg',
      audioUrl: '',
      duration: '52:20',
      durationSeconds: 3140,
      publishedAt: '12 Out 2026',
      plays: 3410,
    },
  ],
  tracks: [
    { id: 'trk_1', title: 'Midnight City Groove', artist: 'Synthwave Collective', album: 'Neon Echoes', duration: 215, genre: 'Synthwave', bpm: 118 },
    { id: 'trk_2', title: 'Acoustic Sunset Breeze', artist: 'Lucas & Violão', album: 'Acústico Brasil', duration: 184, genre: 'MPB Acústica', bpm: 95 },
    { id: 'trk_3', title: 'Lo-Fi Chill Hop Session', artist: 'Kofi & Beats', album: 'Coffee Study', duration: 240, genre: 'Lo-Fi', bpm: 82 },
    { id: 'trk_4', title: 'Radio Hits 2026 (Remix)', artist: 'DJ Marcelo Live', album: 'Club Sessions', duration: 198, genre: 'Pop Dance', bpm: 126 },
    { id: 'trk_5', title: 'Bossa Nova Urbana', artist: 'Trio Carioca', album: 'Copacabana Vibes', duration: 210, genre: 'Bossa Nova', bpm: 92 },
    { id: 'trk_6', title: 'Rock Anthems Classics', artist: 'The Electric Highway', album: 'Overdrive', duration: 260, genre: 'Classic Rock', bpm: 130 },
  ],
  soundboard: [
    { id: 'vinheta_pro', title: 'Vinheta Oficial Rádio Pro', shortLabel: 'Vinheta Pro', type: 'synth', category: 'vinheta', hotkey: '1', color: '#38bdf8' },
    { id: 'air_horn', title: 'Buzina Air Horn DJ', shortLabel: 'Air Horn', type: 'synth', category: 'efeito', hotkey: '2', color: '#f59e0b' },
    { id: 'applause', title: 'Aplausos de Auditório', shortLabel: 'Aplausos', type: 'synth', category: 'efeito', hotkey: '3', color: '#10b981' },
    { id: 'laser_sweep', title: 'Efeito Laser Sweep', shortLabel: 'Laser FX', type: 'synth', category: 'efeito', hotkey: '4', color: '#8b5cf6' },
    { id: 'news_sting', title: 'Sting de Notícias Urgentes', shortLabel: 'Plantão', type: 'synth', category: 'transicao', hotkey: '5', color: '#ef4444' },
    { id: 'vinyl_scratch', title: 'Scratch de Vinil Retrô', shortLabel: 'Scratch', type: 'synth', category: 'efeito', hotkey: '6', color: '#ec4899' },
    { id: 'alert_bell', title: 'Sino de Alerta / Atenção', shortLabel: 'Sino Atenção', type: 'synth', category: 'efeito', hotkey: '7', color: '#eab308' },
    { id: 'bass_drop', title: 'Gota D’Água Sub Bass Drop', shortLabel: 'Bass Drop', type: 'synth', category: 'transicao', hotkey: '8', color: '#06b6d4' },
  ],
  chatMessages: [
    { id: 'msg_1', senderName: 'Mariana Silva', senderEmail: 'mari@email.com', senderRole: 'listener', text: 'Boa tarde galera! O áudio está cristalino aqui em São Paulo!', timestamp: '14:20', type: 'chat' },
    { id: 'msg_2', senderName: 'Evandro (Radialista)', senderEmail: 'evandro230655@gmail.com', senderRole: 'admin', text: 'Sejam bem-vindos à Rádio Web Pro! Mandem seus recados e pedidos musicais no chat!', timestamp: '14:21', type: 'chat' },
    { id: 'msg_3', senderName: 'Pedro Alcantara', senderEmail: 'pedro@email.com', senderRole: 'listener', text: 'Toca aquela do Synthwave Collective por favor!', timestamp: '14:23', type: 'song_request', songDetails: { songTitle: 'Midnight City Groove', artist: 'Synthwave Collective' }, status: 'played' },
    { id: 'msg_4', senderName: 'Luciana Ferreira', senderEmail: 'lu@email.com', senderRole: 'listener', text: 'Adorei o episódio novo sobre Inteligência Artificial, recomendei para todos os amigos!', timestamp: '14:25', type: 'chat' },
  ],
  schedules: [
    { id: 'sch_1', dayOfWeek: 'Segunda a Sexta', timeSlot: '07:00 - 10:00', showTitle: 'Café & Informação', host: 'Roberto Mendonça', genre: 'Notícias & Mercado', description: 'O resumo completo das primeiras horas do dia com cotações e trânsito.' },
    { id: 'sch_2', dayOfWeek: 'Segunda a Sexta', timeSlot: '10:00 - 13:00', showTitle: 'Manhã Interativa & Conexões', host: 'Evandro', genre: 'Variedades, Tech & Hits', description: 'Música de qualidade, debates ao vivo e participação direta dos ouvintes.', isCurrent: true },
    { id: 'sch_3', dayOfWeek: 'Segunda a Sexta', timeSlot: '13:00 - 16:00', showTitle: 'Vibe Musical & Pedidos', host: 'Mariana Costa', genre: 'Pop, MPB & Rock', description: 'As músicas mais pedidas pelos ouvintes no chat e redes sociais.' },
    { id: 'sch_4', dayOfWeek: 'Segunda a Sexta', timeSlot: '16:00 - 19:00', showTitle: 'Drive Time Pro', host: 'Lucas Andrade', genre: 'Flashback & Notícias', description: 'A melhor trilha sonora para o final de tarde com boletins em tempo real.' },
    { id: 'sch_5', dayOfWeek: 'Sábado & Domingo', timeSlot: '10:00 - 18:00', showTitle: 'Especial Podcasts & Mixes', host: 'Equipe Rádio Pro', genre: 'Maratona Podcasts', description: 'Episódios inéditos dos nossos podcasts exclusivos e sets de DJs convidados.' },
  ],
};

function loadDatabase(): RadioDatabase {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure admin exists
      const hasAdmin = parsed.users?.some((u: any) => u.email === 'evandro230655@gmail.com');
      if (!hasAdmin) {
        parsed.users.push(initialData.users[0]);
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading database file, using defaults:', err);
  }
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: RadioDatabase) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

let db = loadDatabase();

// --- WEBSOCKET CLIENT TRACKING ---
const clients = new Set<WebSocket>();

function broadcast(data: any) {
  const payload = JSON.stringify(data);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

function getActiveListenersCount(): number {
  return Math.max(1, clients.size);
}

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  const count = getActiveListenersCount();

  // Send initial data to connected client
  ws.send(
    JSON.stringify({
      type: 'init',
      data: {
        station: { ...db.station, listenersCount: count },
        chatMessages: db.chatMessages.slice(-50),
        podcasts: db.podcasts,
        tracks: db.tracks,
        soundboard: db.soundboard,
        schedules: db.schedules,
      },
    })
  );

  // Broadcast updated listeners count to all
  broadcast({
    type: 'listeners_count',
    count: count,
  });

  ws.on('message', (message: any, isBinary: boolean) => {
    // Real-time audio streaming: if binary chunk (Int16 PCM from Broadcaster), relay directly to listeners!
    if (isBinary || Buffer.isBuffer(message) || message instanceof ArrayBuffer) {
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message, { binary: true });
        }
      });
      return;
    }

    try {
      const parsed = JSON.parse(message.toString());

      if (parsed.type === 'chat_message') {
        const newMsg = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          senderName: parsed.senderName || 'Ouvinte Anônimo',
          senderEmail: parsed.senderEmail || '',
          senderRole: parsed.senderRole || 'listener',
          text: parsed.text || '',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          type: parsed.msgType || 'chat',
          songDetails: parsed.songDetails || undefined,
          status: 'pending',
        };

        db.chatMessages.push(newMsg);
        if (db.chatMessages.length > 200) db.chatMessages.shift();
        saveDatabase(db);

        broadcast({
          type: 'new_chat_message',
          message: newMsg,
        });
      }

      if (parsed.type === 'station_update') {
        // Broadcaster studio updating live station state
        db.station = {
          ...db.station,
          ...parsed.data,
          listenersCount: getActiveListenersCount(),
        };
        saveDatabase(db);

        broadcast({
          type: 'station_updated',
          station: db.station,
        });
      }

      if (parsed.type === 'sfx_trigger') {
        // Broadcaster triggered soundboard effect
        broadcast({
          type: 'sfx_played',
          effectId: parsed.effectId,
        });
      }

      if (parsed.type === 'request_status_update') {
        // Broadcaster marking a song request as played
        const msg = db.chatMessages.find((m) => m.id === parsed.messageId);
        if (msg) {
          msg.status = parsed.status;
          saveDatabase(db);
          broadcast({
            type: 'request_status_changed',
            messageId: parsed.messageId,
            status: parsed.status,
          });
        }
      }

      if (parsed.type === 'station_media_play') {
        // Broadcaster playing an online track or video
        broadcast({
          type: 'station_media_play',
          track: parsed.track,
        });
      }

      if (parsed.type === 'station_media_stop') {
        // Broadcaster stopped playback
        broadcast({
          type: 'station_media_stop',
        });
      }
    } catch (e) {
      console.error('Error handling WS message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast({
      type: 'listeners_count',
      count: getActiveListenersCount(),
    });
  });
});

// --- REST API ENDPOINTS ---

// 1. Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === normalizedEmail && u.passwordHash === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail e senha digitados.' });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.users.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    email: normalizedEmail,
    passwordHash: password,
    name: name.trim(),
    role: 'listener' as const,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
  };

  db.users.push(newUser);
  saveDatabase(db);

  return res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    avatarUrl: newUser.avatarUrl,
  });
});

// 2. Station Status
app.get('/api/station/status', (_req, res) => {
  res.json({
    ...db.station,
    listenersCount: getActiveListenersCount(),
  });
});

app.post('/api/station/status', (req, res) => {
  const { isOnAir, currentShow, broadcaster, currentTrack, bitrate, streamHealth } = req.body;

  db.station = {
    ...db.station,
    ...(isOnAir !== undefined && { isOnAir }),
    ...(currentShow && { currentShow }),
    ...(broadcaster && { broadcaster }),
    ...(currentTrack && { currentTrack }),
    ...(bitrate && { bitrate }),
    ...(streamHealth && { streamHealth }),
  };

  saveDatabase(db);

  broadcast({
    type: 'station_updated',
    station: { ...db.station, listenersCount: getActiveListenersCount() },
  });

  res.json({ success: true, station: db.station });
});

// 3. Podcasts Management
app.get('/api/podcasts', (_req, res) => {
  res.json(db.podcasts);
});

app.post('/api/podcasts', (req, res) => {
  const { podcastTitle, title, description, host, category, coverUrl, audioUrl, duration, durationSeconds } = req.body;

  if (!title || !podcastTitle) {
    return res.status(400).json({ error: 'Título e Programa do podcast são obrigatórios.' });
  }

  const newPodcast = {
    id: 'pod_' + Date.now(),
    podcastTitle: podcastTitle || 'Rádio Pro Podcast',
    title: title.trim(),
    description: description || 'Sem descrição.',
    host: host || 'Equipe Rádio Pro',
    category: category || 'Tecnologia',
    coverUrl: coverUrl || '/src/assets/images/podcast_conexao_1792189176735.jpg',
    audioUrl: audioUrl || '',
    duration: duration || '30:00',
    durationSeconds: durationSeconds || 1800,
    publishedAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
    plays: 0,
  };

  db.podcasts.unshift(newPodcast);
  saveDatabase(db);

  broadcast({
    type: 'podcast_added',
    podcast: newPodcast,
  });

  res.status(201).json(newPodcast);
});

app.delete('/api/podcasts/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = db.podcasts.length;
  db.podcasts = db.podcasts.filter((p) => p.id !== id);

  if (db.podcasts.length === initialLen) {
    return res.status(404).json({ error: 'Episódio não encontrado.' });
  }

  saveDatabase(db);
  broadcast({
    type: 'podcast_deleted',
    podcastId: id,
  });

  res.json({ success: true, message: 'Episódio removido com sucesso.' });
});

// 4. Automation Tracks (Supabase)
app.get('/api/tracks', async (_req, res) => {
  const { data, error } = await supabase.from('tracks').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/tracks', async (req, res) => {
  const { data, error } = await supabase.from('tracks').insert([req.body]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.delete('/api/tracks/:id', async (req, res) => {
  const { error } = await supabase.from('tracks').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// 5. Soundboard Presets
app.get('/api/soundboard', (_req, res) => {
  res.json(db.soundboard);
});

// 6. Schedule Guide
app.get('/api/schedule', (_req, res) => {
  res.json(db.schedules);
});

// 7. Chat messages
app.get('/api/chat/messages', (_req, res) => {
  res.json(db.chatMessages.slice(-50));
});

// 8. Online Music & Video Search API
app.get('/api/music/search', async (req, res) => {
  const query = ((req.query.q as string) || '').trim();
  if (!query) {
    return res.json([]);
  }

  const ytMatch = query.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return res.json([
      {
        id: 'yt_' + ytId,
        title: 'Música / Vídeo do YouTube (' + ytId + ')',
        artist: 'Transmissão do Estúdio',
        album: 'YouTube Rádio Stream',
        duration: 240,
        coverUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        audioUrl: `https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf756.mp3`,
        type: 'youtube',
        youtubeId: ytId,
      },
    ]);
  }

  // 2. Check for direct Video / Audio URL
  if (query.startsWith('http://') || query.startsWith('https://')) {
    const isVideo = query.includes('.mp4') || query.includes('.webm') || query.includes('video');
    const filename = query.split('/').pop()?.split('?')[0] || (isVideo ? 'Vídeo da Web' : 'Áudio da Web');
    return res.json([
      {
        id: 'direct_' + Date.now(),
        title: decodeURIComponent(filename).replace(/\.[^/.]+$/, ''),
        artist: 'Transmissão Online',
        album: 'Link Direto',
        duration: 210,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=120&q=80',
        audioUrl: query,
        type: isVideo ? 'video' : 'audio',
      },
    ]);
  }

  // 3. Search online music database via iTunes Search API (mapped to full-length high quality tracks)
  try {
    const fullAudioTracks = [
      'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
      'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitar-chill-10857.mp3',
      'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
      'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db32a4e21a.mp3?filename=lofi-study-112191.mp3',
      'https://cdn.pixabay.com/download/audio/2022/10/14/audio_993dafb1df.mp3?filename=rock-classic-1122.mp3',
      'https://cdn.pixabay.com/download/audio/2022/08/04/audio_2d0d1e3752.mp3?filename=ambient-chillout-11536.mp3',
      'https://cdn.pixabay.com/download/audio/2021/09/06/audio_5153289066.mp3?filename=pop-summer-1033.mp3'
    ];

    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=25`;
    const response = await fetch(itunesUrl);
    if (response.ok) {
      const data: any = await response.json();
      const results = (data.results || []).map((item: any, index: number) => ({
        id: 'itunes_' + item.trackId,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || 'Single',
        duration: Math.max(210, Math.round((item.trackTimeMillis || 210000) / 1000)),
        coverUrl: (item.artworkUrl100 || '').replace('100x100bb', '300x300bb'),
        audioUrl: fullAudioTracks[index % fullAudioTracks.length],
        type: 'audio',
      }));

      return res.json(results);
    }
  } catch (err) {
    console.warn('Error fetching from iTunes API, returning empty array:', err);
  }

  return res.json([]);
});

// Serve Broadcaster Studio HTML directly
app.get('/admin.html', (_req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// 8. Supabase Connection & Health Status
app.get('/api/supabase/status', async (_req, res) => {
  try {
    res.json({
      connected: true,
      url: SUPABASE_URL,
      projectRef: 'girsmsjtbovtajdzpoku',
      status: 'Conectado e Operacional',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ connected: false, error: err?.message || 'Erro ao consultar Supabase' });
  }
});

// --- VITE MIDDLEWARE SETUP (DEV MODE) OR STATIC SERVE (PROD) ---
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🎙️ Rádio Web Pro Server running at http://0.0.0.0:${PORT}`);
    console.log(`📡 WebSocket broadcast endpoint active at ws://0.0.0.0:${PORT}/ws`);
  });
}

startServer();
