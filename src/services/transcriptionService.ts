// AI Voice Transcription Service (Whisper & Web Speech API)

export type TranscriptionProvider = 'browser' | 'groq' | 'openai' | 'huggingface';

export interface TranscriptionConfig {
  provider: TranscriptionProvider;
  apiKey?: string;
  language?: string;
}

const CONFIG_STORAGE_KEY = 'commonplace_transcription_config';

class TranscriptionService {
  private config: TranscriptionConfig = {
    provider: 'browser',
    language: 'en',
  };

  constructor() {
    this.loadConfig();
  }

  public loadConfig(): TranscriptionConfig {
    if (typeof window === 'undefined') return this.config;
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not load transcription config:', e);
    }
    return this.config;
  }

  public saveConfig(newConfig: Partial<TranscriptionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
      } catch (e) {
        console.warn('Could not save transcription config:', e);
      }
    }
  }

  public getConfig(): TranscriptionConfig {
    return { ...this.config };
  }

  // Transcribe an audio Blob or Base64 URI using AI Whisper or available provider
  public async transcribeAudioBlob(
    audioBlobOrBase64: Blob | string,
    fallbackText: string = '',
    lang: string = 'en'
  ): Promise<{ transcript: string; source: 'whisper' | 'browser' | 'fallback' }> {
    // If we already have a full live transcript from Web Speech, use it
    if (fallbackText && fallbackText.trim().length > 3 && !this.config.apiKey) {
      return { transcript: fallbackText.trim(), source: 'browser' };
    }

    let blob: Blob;

    if (typeof audioBlobOrBase64 === 'string') {
      if (audioBlobOrBase64.startsWith('data:')) {
        blob = this.base64ToBlob(audioBlobOrBase64);
      } else {
        try {
          const res = await fetch(audioBlobOrBase64);
          blob = await res.blob();
        } catch (e) {
          return { transcript: fallbackText || '', source: 'fallback' };
        }
      }
    } else {
      blob = audioBlobOrBase64;
    }

    if (!blob || blob.size < 500) {
      return { transcript: fallbackText || '', source: 'fallback' };
    }

    // 1. Try Groq Whisper (Ultra-fast 200ms transcription)
    if (this.config.provider === 'groq' && this.config.apiKey) {
      try {
        const text = await this.transcribeWithGroq(blob, this.config.apiKey, lang);
        if (text) return { transcript: text, source: 'whisper' };
      } catch (e) {
        console.warn('Groq Whisper error:', e);
      }
    }

    // 2. Try OpenAI Whisper API
    if (this.config.provider === 'openai' && this.config.apiKey) {
      try {
        const text = await this.transcribeWithOpenAI(blob, this.config.apiKey, lang);
        if (text) return { transcript: text, source: 'whisper' };
      } catch (e) {
        console.warn('OpenAI Whisper error:', e);
      }
    }

    // 3. Try Hugging Face Inference API
    if (this.config.provider === 'huggingface' && this.config.apiKey) {
      try {
        const text = await this.transcribeWithHuggingFace(blob, this.config.apiKey);
        if (text) return { transcript: text, source: 'whisper' };
      } catch (e) {
        console.warn('Hugging Face Whisper error:', e);
      }
    }

    // Default: return live transcript collected by Web Speech API
    return { transcript: fallbackText || '', source: 'browser' };
  }

  // Transcribe via Groq Whisper API
  private async transcribeWithGroq(blob: Blob, apiKey: string, lang: string): Promise<string> {
    const formData = new FormData();
    const mimeType = blob.type || 'audio/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('aac') ? 'aac' : 'webm';
    formData.append('file', blob, `recording.${extension}`);
    formData.append('model', 'whisper-large-v3');
    formData.append('temperature', '0');
    if (lang && lang.length === 2) {
      formData.append('language', lang);
    }

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Groq Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  }

  // Transcribe via OpenAI Whisper API
  private async transcribeWithOpenAI(blob: Blob, apiKey: string, lang: string): Promise<string> {
    const formData = new FormData();
    const mimeType = blob.type || 'audio/webm';
    const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('aac') ? 'aac' : 'webm';
    formData.append('file', blob, `recording.${extension}`);
    formData.append('model', 'whisper-1');
    formData.append('temperature', '0');
    if (lang && lang.length === 2) {
      formData.append('language', lang);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `OpenAI Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  }

  // Transcribe via Hugging Face Serverless Whisper API
  private async transcribeWithHuggingFace(blob: Blob, apiKey: string): Promise<string> {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/openai/whisper-large-v3-turbo',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': blob.type || 'audio/webm',
        },
        body: blob,
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  }

  // Convert Base64 Data URI to Blob
  private base64ToBlob(base64DataUri: string): Blob {
    const parts = base64DataUri.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'audio/webm';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}

export const transcriptionService = new TranscriptionService();
