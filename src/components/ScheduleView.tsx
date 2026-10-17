import React, { useState } from 'react';
import { Clock, Radio, Calendar, User, ChevronRight, Sparkles } from 'lucide-react';
import { ScheduleItem } from '../types';

export const ScheduleView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<'Segunda a Sexta' | 'Fim de Semana'>('Segunda a Sexta');

  const scheduleList: ScheduleItem[] = [
    {
      id: 'sch_1',
      dayOfWeek: 'Segunda a Sexta',
      timeSlot: '07:00 - 10:00',
      showTitle: 'Café & Informação',
      host: 'Roberto Mendonça',
      genre: 'Notícias & Mercado',
      description: 'O resumo completo das primeiras horas da manhã com as principais manchetes, cotações financeiras e panorama geral.',
    },
    {
      id: 'sch_2',
      dayOfWeek: 'Segunda a Sexta',
      timeSlot: '10:00 - 13:00',
      showTitle: 'Manhã Interativa & Conexões',
      host: 'Evandro (Radialista Principal)',
      genre: 'Variedades, Tech & Hits',
      description: 'Apresentação ao vivo com os maiores lançamentos da música mundial, notícias do mundo tech e interação direta com ouvintes pelo chat.',
      isCurrent: true,
    },
    {
      id: 'sch_3',
      dayOfWeek: 'Segunda a Sexta',
      timeSlot: '13:00 - 16:00',
      showTitle: 'Vibe Musical & Pedidos',
      host: 'Mariana Costa',
      genre: 'Pop, MPB & Rock Alternativo',
      description: 'Músicas escolhidas a dedo com destaque para os pedidos enviados através do mural em tempo real da rádio.',
    },
    {
      id: 'sch_4',
      dayOfWeek: 'Segunda a Sexta',
      timeSlot: '16:00 - 19:00',
      showTitle: 'Drive Time Pro',
      host: 'Lucas Andrade',
      genre: 'Flashback, Synthwave & Informação',
      description: 'A companhia perfeita para o final de expediente e o trânsito com os clássicos marcantes dos anos 80, 90 e 2000.',
    },
    {
      id: 'sch_5',
      dayOfWeek: 'Segunda a Sexta',
      timeSlot: '19:00 - 23:00',
      showTitle: 'Estúdio Noturno & Podcasts',
      host: 'Equipe Rádio Pro',
      genre: 'Podcasts & Entrevistas',
      description: 'Transmissão em alta definição dos podcasts gravados, entrevistas com especialistas e rodadas de debate.',
    },
    {
      id: 'sch_6',
      dayOfWeek: 'Fim de Semana',
      timeSlot: '09:00 - 14:00',
      showTitle: 'Sábado Especial Retrô',
      host: 'Evandro & Convidados',
      genre: 'Flashback & Disco',
      description: 'As melhores faixas de vinil e raridades musicais comentadas faixa a faixa.',
    },
    {
      id: 'sch_7',
      dayOfWeek: 'Fim de Semana',
      timeSlot: '14:00 - 20:00',
      showTitle: 'Maratona Podcasters Brasil',
      host: 'Curadoria Rádio Web Pro',
      genre: 'Podcasts Selecionados',
      description: 'Sequência ininterrupta dos episódios mais ouvidos da semana sobre tecnologia, finanças e cultura.',
    },
    {
      id: 'sch_8',
      dayOfWeek: 'Fim de Semana',
      timeSlot: '20:00 - 02:00',
      showTitle: 'Club Night Sessions',
      host: 'DJs Residentes',
      genre: 'Eletrônica & House Music',
      description: 'Sets mixados ao vivo diretamente dos estúdios com qualidade 320 kbps HD.',
    },
  ];

  const filtered = scheduleList.filter((item) =>
    selectedDay === 'Segunda a Sexta' ? item.dayOfWeek.includes('Segunda') : item.dayOfWeek.includes('Fim de Semana')
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-sky-400" />
            <span>Grade de Programação Semanal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conheça todos os programas, horários e radialistas da Rádio Web Pro.
          </p>
        </div>

        {/* Day Filter */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setSelectedDay('Segunda a Sexta')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedDay === 'Segunda a Sexta'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Segunda a Sexta
          </button>
          <button
            onClick={() => setSelectedDay('Fim de Semana')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedDay === 'Fim de Semana'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sábado & Domingo
          </button>
        </div>
      </div>

      {/* Schedule Timetable Cards */}
      <div className="space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
              item.isCurrent
                ? 'bg-sky-950/40 border-sky-500/60 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Left: Time & Current status */}
            <div className="flex items-center gap-4 min-w-[220px]">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  {item.timeSlot}
                </span>
                <span className="text-xs font-mono text-slate-500 mt-0.5">{item.dayOfWeek}</span>
              </div>

              {item.isCurrent && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>NO AR AGORA</span>
                </div>
              )}
            </div>

            {/* Center: Show Title & Description */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">{item.showTitle}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                  {item.genre}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{item.description}</p>
            </div>

            {/* Right: Host */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800/80 shrink-0">
              <User className="w-4 h-4 text-sky-400" />
              <span>Apresentação: <strong className="text-white">{item.host}</strong></span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
