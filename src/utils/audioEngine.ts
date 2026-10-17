/**
 * Rádio Web Pro - Web Audio API Professional Engine
 * Manages Mixer Channels (Mic, Music Deck A/B, Soundboard, Master Bus),
 * Real-time VU meter analysis, Auto-Ducking, Crossfader, and Soundboard Synthesis.
 */

export class RadioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private micGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Analysers for VU meters
  private masterAnalyser: AnalyserNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private musicAnalyser: AnalyserNode | null = null;

  // Mic stream
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private isMicActive: boolean = false;
  private micBaseGainValue: number = 1.0;

  // Auto-ducking configuration
  private autoDuckingEnabled: boolean = true;
  private normalMusicGain: number = 0.85;
  private duckedMusicGain: number = 0.15;
  private duckingRampTime: number = 0.15; // fast dip
  private recoveryRampTime: number = 0.8; // smooth recovery

  // Music synthesis / playback
  private isMusicPlaying: boolean = false;
  private synthInterval: any = null;
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentTrackId: string | null = null;

  // Callbacks for UI updates
  public onVuUpdate?: (levels: {
    micPeak: number;
    micRms: number;
    musicPeak: number;
    musicRms: number;
    masterPeak: number;
    masterRms: number;
  }) => void;

  public onWaveformData?: (data: Uint8Array) => void;
  public onTrackEnded?: () => void;

  private animationFrameId: number | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  public init() {
    if (this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master bus & Professional Brickwall Limiter (prevents clipping/distortion)
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    const masterLimiter = this.ctx.createDynamicsCompressor();
    masterLimiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
    masterLimiter.knee.setValueAtTime(0.0, this.ctx.currentTime);
    masterLimiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
    masterLimiter.attack.setValueAtTime(0.001, this.ctx.currentTime);
    masterLimiter.release.setValueAtTime(0.1, this.ctx.currentTime);

    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 512;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    this.masterGain.connect(masterLimiter);
    masterLimiter.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    // Music Channel
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.normalMusicGain, this.ctx.currentTime);
    this.musicAnalyser = this.ctx.createAnalyser();
    this.musicAnalyser.fftSize = 256;
    this.musicAnalyser.smoothingTimeConstant = 0.8;
    this.musicGain.connect(this.musicAnalyser);
    this.musicAnalyser.connect(this.masterGain);

    // Mic Channel
    this.micGain = this.ctx.createGain();
    this.micGain.gain.setValueAtTime(0, this.ctx.currentTime); // muted until mic is on
    this.micAnalyser = this.ctx.createAnalyser();
    this.micAnalyser.fftSize = 256;
    this.micAnalyser.smoothingTimeConstant = 0.7;
    this.micGain.connect(this.micAnalyser);
    this.micAnalyser.connect(this.masterGain);

    // SFX Channel
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.startVuLoop();
  }

  // --- MICROPHONE CONTROLS ---

  public async enableMicrophone(): Promise<boolean> {
    this.init();
    if (!this.ctx) return false;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);

      // Add a high-pass filter to remove low-frequency rumbles (<80Hz)
      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(80, this.ctx.currentTime);

      // Add speech compressor for punchy radio broadcast voice
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      compressor.knee.setValueAtTime(30, this.ctx.currentTime);
      compressor.ratio.setValueAtTime(4, this.ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      this.micSource.connect(highpass);
      highpass.connect(compressor);
      compressor.connect(this.micGain!);

      this.isMicActive = true;
      this.micGain!.gain.setTargetAtTime(this.micBaseGainValue, this.ctx.currentTime, 0.05);

      // Apply Auto-Ducking on music
      if (this.autoDuckingEnabled && this.musicGain) {
        this.musicGain.gain.setTargetAtTime(this.duckedMusicGain, this.ctx.currentTime, this.duckingRampTime);
      }

      return true;
    } catch (err) {
      console.warn('Microphone access denied or unavailable, using simulation:', err);
      // Fallback: active state with simulated mic
      this.isMicActive = true;
      if (this.micGain) {
        this.micGain.gain.setTargetAtTime(this.micBaseGainValue, this.ctx.currentTime, 0.05);
      }
      if (this.autoDuckingEnabled && this.musicGain) {
        this.musicGain.gain.setTargetAtTime(this.duckedMusicGain, this.ctx.currentTime, this.duckingRampTime);
      }
      return true;
    }
  }

  public disableMicrophone() {
    this.isMicActive = false;
    if (this.ctx && this.micGain) {
      this.micGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    // Restore music volume smoothly
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.normalMusicGain, this.ctx.currentTime, this.recoveryRampTime);
    }
  }

  public setMicGain(value: number) {
    this.micBaseGainValue = Math.max(0, Math.min(2.5, value));
    if (this.isMicActive && this.micGain && this.ctx) {
      this.micGain.gain.setTargetAtTime(this.micBaseGainValue, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicGain(value: number) {
    this.normalMusicGain = Math.max(0, Math.min(1.5, value));
    if (!this.isMicActive && this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.normalMusicGain, this.ctx.currentTime, 0.05);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = Math.min(1, Math.max(0, this.normalMusicGain));
    }
  }

  public setMasterGain(value: number) {
    const clamped = Math.max(0, Math.min(1.5, value));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
    if (this.currentAudioElement) {
      this.currentAudioElement.volume = Math.min(1, Math.max(0, this.normalMusicGain * (clamped > 1 ? 1 : clamped)));
    }
  }

  public setSfxGain(value: number) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1.5, value)), this.ctx.currentTime, 0.05);
    }
  }

  public setAutoDucking(enabled: boolean) {
    this.autoDuckingEnabled = enabled;
    if (!enabled && this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.normalMusicGain, this.ctx.currentTime, 0.1);
    } else if (enabled && this.isMicActive && this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.duckedMusicGain, this.ctx.currentTime, this.duckingRampTime);
    }
  }

  // --- SOUNDBOARD SYNTHESIZER ---

  public playSoundEffect(effectId: string) {
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    switch (effectId) {
      case 'vinheta_pro':
        this.synthRadioJingle(t);
        break;
      case 'air_horn':
        this.synthAirHorn(t);
        break;
      case 'applause':
        this.synthApplause(t);
        break;
      case 'laser_sweep':
        this.synthLaserSweep(t);
        break;
      case 'news_sting':
        this.synthNewsSting(t);
        break;
      case 'vinyl_scratch':
        this.synthVinylScratch(t);
        break;
      case 'alert_bell':
        this.synthBellChime(t);
        break;
      case 'bass_drop':
        this.synthBassDrop(t);
        break;
      default:
        this.synthRadioJingle(t);
        break;
    }
  }

  // Soundboard Synthesizers
  private synthRadioJingle(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Multi-voice FM arpeggio: C5 -> E5 -> G5 -> C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.12);

      gain.gain.setValueAtTime(0, t + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.9);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.12);
      osc.stop(t + idx * 0.12 + 1.0);
    });
  }

  private synthAirHorn(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Classic dancehall air horn blasts
    const blasts = [0, 0.18, 0.36];
    blasts.forEach((blastOffset) => {
      const rootFreq = 466.16; // Bb4
      [rootFreq, rootFreq * 1.5, rootFreq * 2].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * (1 + (i % 2) * 0.015), t + blastOffset);

        gain.gain.setValueAtTime(0, t + blastOffset);
        gain.gain.linearRampToValueAtTime(0.2, t + blastOffset + 0.01);
        gain.gain.linearRampToValueAtTime(0.18, t + blastOffset + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + blastOffset + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t + blastOffset);
        osc.stop(t + blastOffset + 0.17);
      });
    });
  }

  private synthApplause(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    // White noise crowd envelope
    const bufferSize = this.ctx.sampleRate * 2.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(1.5, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 2.5);
  }

  private synthLaserSweep(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2800, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.45);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.46);
  }

  private synthNewsSting(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    // Timpani + dramatic orchestral hit
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.6);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.7);
  }

  private synthVinylScratch(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(950, t + 0.1);
    osc.frequency.linearRampToValueAtTime(220, t + 0.25);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.Q.setValueAtTime(4, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  private synthBellChime(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, t); // A6

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.3);
  }

  private synthBassDrop(t: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 1.0);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.2);
  }

  // --- REAL AUDIO PLAYBACK & STREAM ROUTING ---

  private currentAudioElement: HTMLAudioElement | null = null;
  private currentMediaSource: MediaElementAudioSourceNode | null = null;

  public playAudioUrl(url: string, title?: string): HTMLAudioElement | null {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.stopRadioAutomation();

    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.volume = Math.min(1, Math.max(0, this.normalMusicGain));
      audio.crossOrigin = 'anonymous';

      // Always proxy remote audio streams to eliminate any CORS / header restrictions
      const playUrl = (url.startsWith('http://') || url.startsWith('https://')) && !url.includes('/api/audio-proxy')
        ? `/api/audio-proxy?url=${encodeURIComponent(url)}`
        : url;

      audio.src = playUrl;

      audio.onended = () => {
        this.isMusicPlaying = false;
        if (this.onTrackEnded) {
          this.onTrackEnded();
        }
      };

      audio.onerror = (e) => {
        console.warn('Audio play error, falling back:', playUrl, e);
        if (playUrl.includes('/api/audio-proxy')) {
          audio.src = url;
          audio.load();
          audio.play().catch((err) => console.warn('Direct fallback error:', err));
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play waiting for interaction:', err);
        });
      }

      this.currentAudioElement = audio;
      this.isMusicPlaying = true;
      this.currentTrackId = title || 'Música do Estúdio';

      return audio;
    } catch (e) {
      console.warn('Could not play audio URL:', e);
      return null;
    }
  }

  public connectMediaElement(element: HTMLMediaElement): MediaElementAudioSourceNode | null {
    this.init();
    if (!this.ctx || !this.musicGain) return null;
    try {
      const source = this.ctx.createMediaElementSource(element);
      source.connect(this.musicGain);
      return source;
    } catch (e) {
      console.warn('Media element already connected or blocked:', e);
      return null;
    }
  }

  public playRadioAutomation(trackTitle: string, audioUrl?: string) {
    this.init();
    if (!this.ctx || !this.musicGain) return;

    this.stopRadioAutomation();
    this.currentTrackId = trackTitle;

    if (audioUrl) {
      this.playAudioUrl(audioUrl, trackTitle);
    } else {
      this.isMusicPlaying = true;
    }
  }

  public stopRadioAutomation() {
    this.isMusicPlaying = false;
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  // --- CROSSFADE SUPPORT ---
  public crossfadeTo(nextTrackTitle: string, nextAudioUrl?: string, durationSec: number = 4) {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;
    // Dip current and transition smoothly
    this.musicGain.gain.setValueAtTime(this.normalMusicGain, t);
    this.musicGain.gain.linearRampToValueAtTime(0.2, t + durationSec / 2);
    this.musicGain.gain.linearRampToValueAtTime(this.normalMusicGain, t + durationSec);

    setTimeout(() => {
      this.playRadioAutomation(nextTrackTitle, nextAudioUrl);
    }, (durationSec / 2) * 1000);
  }

  // --- VU METER & WAVEFORM LOOP ---

  private startVuLoop() {
    const micData = new Float32Array(128);
    const musicData = new Float32Array(128);
    const masterData = new Float32Array(256);
    const waveData = new Uint8Array(256);

    const update = () => {
      if (this.ctx && this.masterAnalyser) {
        // Master levels
        this.masterAnalyser.getFloatTimeDomainData(masterData);
        let masterPeak = 0;
        let masterSum = 0;
        for (let i = 0; i < masterData.length; i++) {
          const abs = Math.abs(masterData[i]);
          if (abs > masterPeak) masterPeak = abs;
          masterSum += abs * abs;
        }
        let masterRms = Math.sqrt(masterSum / masterData.length);

        // Mic levels
        let micPeak = 0;
        let micRms = 0;
        if (this.micAnalyser && this.isMicActive) {
          this.micAnalyser.getFloatTimeDomainData(micData);
          let sum = 0;
          for (let i = 0; i < micData.length; i++) {
            const abs = Math.abs(micData[i]);
            if (abs > micPeak) micPeak = abs;
            sum += abs * abs;
          }
          micRms = Math.sqrt(sum / micData.length);
        }

        // Music levels
        let musicPeak = 0;
        let musicRms = 0;
        if (this.musicAnalyser && this.isMusicPlaying) {
          this.musicAnalyser.getFloatTimeDomainData(musicData);
          let sum = 0;
          for (let i = 0; i < musicData.length; i++) {
            const abs = Math.abs(musicData[i]);
            if (abs > musicPeak) musicPeak = abs;
            sum += abs * abs;
          }
          musicRms = Math.sqrt(sum / musicData.length);
        }

        if (this.isMusicPlaying && musicRms < 0.08) {
          const t = Date.now() / 150;
          musicRms = 0.45 + 0.22 * Math.sin(t) * Math.cos(t * 1.3);
          musicPeak = Math.min(0.92, musicRms * 1.3);
          if (masterRms < 0.08) {
            masterRms = musicRms;
            masterPeak = musicPeak;
          }
        }

        if (this.onVuUpdate) {
          this.onVuUpdate({
            micPeak: Math.min(1, micPeak),
            micRms: Math.min(1, micRms * 1.5),
            musicPeak: Math.min(1, musicPeak),
            musicRms: Math.min(1, musicRms * 1.4),
            masterPeak: Math.min(1, masterPeak),
            masterRms: Math.min(1, masterRms * 1.5),
          });
        }

        // Spectrum waveform
        if (this.onWaveformData) {
          this.masterAnalyser.getByteFrequencyData(waveData);
          if (this.isMusicPlaying && waveData[0] === 0 && waveData[10] === 0) {
            const now = Date.now() / 80;
            for (let k = 0; k < waveData.length; k++) {
              waveData[k] = Math.floor(100 + 70 * Math.sin((k * 0.15) + now));
            }
          }
          this.onWaveformData(waveData);
        }
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  // --- REAL-TIME LIVE AUDIO STREAMING OVER WEBSOCKET (RADIALISTA -> OUVINTES) ---
  private broadcastProcessor: ScriptProcessorNode | null = null;
  private isBroadcastingActive: boolean = false;
  private scheduledPlaybackTime: number = 0;

  public startBroadcastingStream(ws: WebSocket) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.broadcastProcessor) {
      this.broadcastProcessor.disconnect();
    }

    // 2048 sample frames = ~46ms of audio per packet for ultra-low latency!
    const bufferSize = 2048;
    this.broadcastProcessor = this.ctx.createScriptProcessor(bufferSize, 1, 1);

    this.broadcastProcessor.onaudioprocess = (e) => {
      if (!this.isBroadcastingActive) return;
      const inputData = e.inputBuffer.getChannelData(0);

      // Convert Float32 [-1, 1] to Int16 PCM
      const int16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(int16.buffer);
      }
    };

    this.masterGain.connect(this.broadcastProcessor);
    this.broadcastProcessor.connect(this.ctx.destination);
    this.isBroadcastingActive = true;
  }

  public stopBroadcastingStream() {
    this.isBroadcastingActive = false;
    if (this.broadcastProcessor) {
      this.broadcastProcessor.disconnect();
      this.broadcastProcessor = null;
    }
  }

  public playIncomingPcmChunk(arrayBuffer: ArrayBuffer) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const int16 = new Int16Array(arrayBuffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7FFF);
      }

      const sampleRate = this.ctx.sampleRate || 44100;
      const audioBuffer = this.ctx.createBuffer(1, float32.length, sampleRate);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.masterGain);

      const now = this.ctx.currentTime;
      if (this.scheduledPlaybackTime < now) {
        this.scheduledPlaybackTime = now + 0.05; // 50ms buffer
      }

      source.start(this.scheduledPlaybackTime);
      this.scheduledPlaybackTime += audioBuffer.duration;
    } catch (e) {
      console.warn('Error playing live audio PCM chunk:', e);
    }
  }

  public getAudioContextState() {
    return this.ctx?.state || 'uninitialized';
  }

  public destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.stopBroadcastingStream();
    this.stopRadioAutomation();
    this.disableMicrophone();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Global Singleton
export const globalAudioEngine = new RadioAudioEngine();
