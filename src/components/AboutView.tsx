import React, { useState } from 'react';
import {
  Server,
  RadioTower,
  Cpu,
  Layers,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Globe
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const localInstallCode = `# 1. Clonar o repositório ou baixar os arquivos
git clone https://github.com/seu-usuario/radio-web-pro.git
cd radio-web-pro

# 2. Instalar todas as dependências
npm install

# 3. Iniciar o servidor de desenvolvimento full-stack (Express + WebSocket + Vite)
npm run dev

# Acesse no seu navegador:
# http://localhost:3000`;

  const renderDeployCode = `# 1. Configuração no painel da Render:
# Build Command: npm install && npm run build
# Start Command: npm start
# Environment Variables:
#   NODE_ENV=production
#   PORT=10000`;

  const vpsDeployCode = `# --- Instalação em VPS Ubuntu / Debian ---

# 1. Instalar Node.js 20+ e PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2

# 2. Clonar projeto e compilar
cd /var/www
git clone <seu-repositorio> radio-web-pro
cd radio-web-pro
npm install
npm run build

# 3. Iniciar com PM2 para manter o servidor online
pm2 start server.ts --name "radioweb-pro" --interpreter ./node_modules/.bin/tsx
pm2 save
pm2 startup

# 4. Configuração do Nginx (/etc/nginx/sites-available/radio)
server {
    server_name radiowebpro.seudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 5. Ativar site e SSL Let's Encrypt gratuito
sudo ln -s /etc/nginx/sites-available/radio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d radiowebpro.seudominio.com`;

  const dockerfileCode = `# Dockerfile Multi-stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npx", "tsx", "server.ts"]`;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <RadioTower className="w-8 h-8 text-sky-400" />
          <span>Arquitetura & Guia de Implantação da Rádio Web Pro</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Documentação técnica detalhada, credenciais de acesso e instruções de execução para ambientes locais e servidores de produção.
        </p>
      </div>

      {/* Account Levels Box */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Níveis de Acesso e Contas Configuradas</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-sky-500/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
                Administrador / Radialista Master
              </span>
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-[10px]">
                Acesso Total
              </span>
            </div>
            <p className="text-slate-300">
              Acesso exclusivo à <strong>Mesa de Som Virtual</strong>, transmissão ao vivo via microfone, disparo do Soundboard FX, automação de músicas e publicação de novos podcasts.
            </p>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] space-y-1 text-slate-300">
              <div>E-mail: <strong className="text-white">evandro230655@gmail.com</strong></div>
              <div>Senha: <strong className="text-white">230655</strong></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Ouvinte / Membro Comum
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                Público
              </span>
            </div>
            <p className="text-slate-400">
              Acesso ao player de rádio ao vivo com baixa latência, mural de chat, solicitação de músicas ("Pedir Música"), catálogo de podcasts e download de episódios.
            </p>
            <div className="p-2.5 rounded bg-slate-900 font-mono text-[11px] text-slate-400">
              Cadastro público instantâneo na área de login ou através do formulário de criação de conta.
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Specs */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>Especificações Técnicas da Plataforma</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block">Web Audio API</span>
            <p className="text-slate-400">
              Mixer de 4 canais no navegador com compressor dinâmico de voz, high-pass filter, cálculo de VU meter em tempo real e sintetizador nativo de vinhetas.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block">Streaming WebSocket</span>
            <p className="text-slate-400">
              Comunicação bidirecional com baixa latência (`ws`) para distribuição de eventos, controle de ouvintes simultâneos e sincronização de estado.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-sky-400 block">Auto-Ducking & Crossfade</span>
            <p className="text-slate-400">
              Algoritmo de atenuação suave da trilha sonora ao falar no microfone (atenuação para 15% em 150ms e retorno em 800ms) e transição de faixas configurável.
            </p>
          </div>
        </div>
      </div>

      {/* Local Setup Instructions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-400" />
            <span>1. Executando o Projeto Localmente</span>
          </h2>
          <button
            onClick={() => copyToClipboard(localInstallCode, 'local')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            {copiedSection === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'local' ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
          {localInstallCode}
        </pre>
      </div>

      {/* Cloud Deploy (Render & Railway) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <span>2. Deploy em Nuvem (Render / Railway)</span>
          </h2>
          <button
            onClick={() => copyToClipboard(renderDeployCode, 'render')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            {copiedSection === 'render' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'render' ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
          {renderDeployCode}
        </pre>
      </div>

      {/* Production VPS Deploy (Ubuntu + Nginx + PM2 + SSL) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <span>3. Deploy em Servidor VPS Próprio (Ubuntu + Nginx + PM2 + SSL)</span>
          </h2>
          <button
            onClick={() => copyToClipboard(vpsDeployCode, 'vps')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            {copiedSection === 'vps' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'vps' ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
          {vpsDeployCode}
        </pre>
      </div>

      {/* Dockerfile Setup */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>4. Containerização com Docker</span>
          </h2>
          <button
            onClick={() => copyToClipboard(dockerfileCode, 'docker')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
          >
            {copiedSection === 'docker' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'docker' ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
          {dockerfileCode}
        </pre>
      </div>

    </div>
  );
};
