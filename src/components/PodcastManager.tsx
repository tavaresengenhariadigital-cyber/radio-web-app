import React, { useState } from 'react';
import { useRadio } from '../context/RadioContext';
import { PodcastEpisode } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Search,
  Plus,
  Trash2,
  Clock,
  User,
  Tag,
  Headphones,
  CheckCircle,
  X,
  Sliders,
  Volume2,
  Disc3,
  Share2
} from 'lucide-react';

export const PodcastManager: React.FC = () => {
  const {
    podcasts,
    addPodcast,
    deletePodcast,
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
    user,
    isNewPodcastModalOpen,
    setIsNewPodcastModalOpen,
    setIsAuthModalOpen,
  } = useRadio();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // New Podcast Form State
  const [formPodcastTitle, setFormPodcastTitle] = useState('Conexão Tech');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formHost, setFormHost] = useState(user?.name || 'Evandro');
  const [formCategory, setFormCategory] = useState<PodcastEpisode['category']>('Tecnologia');
  const [formDuration, setFormDuration] = useState('35:00');
  const [formCoverUrl, setFormCoverUrl] = useState('/src/assets/images/podcast_conexao_1792189176735.jpg');

  const categories = ['Todos', 'Tecnologia', 'Música & Cultura', 'Jornalismo', 'Empreendedorismo'];

  const filteredPodcasts = podcasts.filter((pod) => {
    const matchesCategory = selectedCategory === 'Todos' || pod.category === selectedCategory;
    const matchesQuery =
      pod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pod.podcastTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const parts = formDuration.split(':');
    let durSec = 1800;
    if (parts.length === 2) {
      durSec = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }

    await addPodcast({
      podcastTitle: formPodcastTitle,
      title: formTitle,
      description: formDescription,
      host: formHost,
      category: formCategory,
      coverUrl: formCoverUrl,
      duration: formDuration,
      durationSeconds: durSec,
    });

    setFormTitle('');
    setFormDescription('');
  };

  const handleDownload = (pod: PodcastEpisode) => {
    setDownloadingId(pod.id);
    setTimeout(() => {
      // Simulate browser download trigger
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' +
          encodeURIComponent(`Rádio Web Pro - Episódio: ${pod.title}\nHost: ${pod.host}\nPodcast: ${pod.podcastTitle}`)
      );
      element.setAttribute('download', `${pod.title.replace(/\s+/g, '_')}.mp3`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setDownloadingId(null);
    }, 1200);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Podcasts Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Disc3 className="w-7 h-7 text-sky-400" />
            <span>Podcasts & Conteúdo Sob Demanda</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ouça os episódios completos dos nossos programas exclusivos quando e onde quiser.
          </p>
        </div>

        {/* Admin New Episode Action */}
        {user?.role === 'admin' ? (
          <button
            onClick={() => setIsNewPodcastModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Novo Episódio</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
          >
            É radialista ou administrador? Faça login
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl">
        
        {/* Categories Tab Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar episódios, temas ou hosts..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPodcasts.map((ep) => {
          const isThisPlaying = activePodcast?.id === ep.id && isPodcastPlaying;

          return (
            <div
              key={ep.id}
              className="group rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
            >
              {/* Cover Art Box */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-950">
                <img
                  src={ep.coverUrl}
                  alt={ep.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                {/* Category kicker */}
                <div className="absolute top-3 left-3 text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-slate-950/80 text-sky-300 backdrop-blur-md border border-slate-800">
                  {ep.category}
                </div>

                {/* Duration indicator */}
                <div className="absolute top-3 right-3 text-[11px] font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md flex items-center gap-1">
                  <Clock className="w-3 h-3 text-sky-400" />
                  <span>{ep.duration}</span>
                </div>

                {/* Quick Play Circle Button */}
                <button
                  onClick={() => {
                    if (isThisPlaying) {
                      pausePodcast();
                    } else if (activePodcast?.id === ep.id) {
                      resumePodcast();
                    } else {
                      playPodcast(ep);
                    }
                  }}
                  className={`absolute bottom-3 right-3 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-90 ${
                    isThisPlaying
                      ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)]'
                  }`}
                  aria-label={isThisPlaying ? 'Pausar episódio' : 'Tocar episódio'}
                >
                  {isThisPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
              </div>

              {/* Episode Content */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-sky-400 uppercase tracking-wider block">
                    {ep.podcastTitle}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {ep.description}
                  </p>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[160px]">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{ep.host}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(ep)}
                      disabled={downloadingId === ep.id}
                      title="Baixar para ouvir offline"
                      className="p-1.5 hover:text-sky-400 hover:bg-slate-800 rounded transition-colors text-slate-400"
                    >
                      {downloadingId === ep.id ? (
                        <span className="text-[10px] text-sky-400 animate-pulse">Baixando...</span>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>

                    {user?.role === 'admin' && (
                      <button
                        onClick={() => deletePodcast(ep.id)}
                        title="Excluir Episódio (Admin)"
                        className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors text-slate-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Modern Podcast Player Bar */}
      {activePodcast && (
        <div className="fixed bottom-14 md:bottom-4 left-4 right-4 z-40 max-w-5xl mx-auto rounded-2xl bg-slate-950/95 border border-sky-500/40 shadow-2xl backdrop-blur-xl p-3 sm:p-4 text-white animate-in slide-in-from-bottom-5">
          <div className="flex flex-col gap-2">
            
            {/* Top row: Track info, play controls, speed, close */}
            <div className="flex items-center justify-between gap-4">
              
              {/* Left: Thumbnail & Titles */}
              <div className="flex items-center gap-3 min-w-0 max-w-[40%] sm:max-w-[30%]">
                <img
                  src={activePodcast.coverUrl}
                  alt={activePodcast.title}
                  className="w-11 h-11 rounded-lg object-cover border border-slate-800 shrink-0"
                />
                <div className="truncate">
                  <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider block truncate">
                    {activePodcast.podcastTitle}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white truncate block">
                    {activePodcast.title}
                  </span>
                </div>
              </div>

              {/* Center: Play, Pause, Jump 15s / 30s */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button
                  onClick={() => seekPodcast(podcastProgress - 15)}
                  title="Voltar 15s"
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => (isPodcastPlaying ? pausePodcast() : resumePodcast())}
                  className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all shadow-md active:scale-95"
                >
                  {isPodcastPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => seekPodcast(podcastProgress + 30)}
                  title="Avançar 30s"
                  className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Right: Speed selector & Close */}
              <div className="flex items-center gap-2 shrink-0">
                
                {/* Playback rate speed buttons */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-mono">
                  {([1, 1.25, 1.5, 2] as const).map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPodcastPlaybackRate(speed)}
                      className={`px-1.5 py-0.5 rounded ${
                        podcastPlaybackRate === speed
                          ? 'bg-sky-500 text-slate-950 font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={closePodcastPlayer}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom row: Progress bar with interactive seek */}
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
              <span className="tabular-nums">{formatTime(podcastProgress)}</span>
              <input
                type="range"
                min="0"
                max={podcastDuration || 100}
                value={podcastProgress}
                onChange={(e) => seekPodcast(parseFloat(e.target.value))}
                className="studio-fader flex-1"
              />
              <span className="tabular-nums">{formatTime(podcastDuration)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal: Create / Upload New Episode */}
      {isNewPodcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNewPodcastModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-400" />
              <span>Publicar Novo Episódio de Podcast</span>
            </h2>

            <form onSubmit={handleCreateEpisode} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Programa / Podcast</label>
                <input
                  type="text"
                  required
                  value={formPodcastTitle}
                  onChange={(e) => setFormPodcastTitle(e.target.value)}
                  placeholder="Ex: Conexão Tech"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Episódio</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: IA e o Futuro das Profissões em 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Host / Apresentador</label>
                  <input
                    type="text"
                    required
                    value={formHost}
                    onChange={(e) => setFormHost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duração estimada</label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="35:00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                >
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Música & Cultura">Música & Cultura</option>
                  <option value="Jornalismo">Jornalismo</option>
                  <option value="Empreendedorismo">Empreendedorismo</option>
                  <option value="Entretenimento">Entretenimento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Capa do Episódio</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[
                    { label: 'Tech Cyan', url: '/src/assets/images/podcast_conexao_1792189176735.jpg' },
                    { label: 'Vinil Beats', url: '/src/assets/images/podcast_cultura_1792189189304.jpg' },
                    { label: 'Notícias Mic', url: '/src/assets/images/podcast_noticias_1792189200864.jpg' },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.url}
                      onClick={() => setFormCoverUrl(preset.url)}
                      className={`p-1 rounded-lg border text-left overflow-hidden ${
                        formCoverUrl === preset.url ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800'
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="w-full aspect-square object-cover rounded mb-1" />
                      <span className="text-[10px] text-slate-300 block truncate">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição do Episódio</label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Resumo dos tópicos discutidos..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-all shadow-md active:scale-95"
              >
                Publicar Episódio Imediatamente
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
