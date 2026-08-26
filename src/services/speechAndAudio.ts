// Voice Recording, Speech-to-Text (Transcription), and Waveform Service

export interface AudioRecordingResult {
  audioUrl?: string;
  transcript: string;
  durationSeconds: number;
  waveform: number[];
}

export class SpeechAndAudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private speechRecognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private startTime: number = 0;
  private recordedWaveform: number[] = [];
  private mediaStream: MediaStream | null = null;
  private restartTimeout: any = null;
  private currentAudioElement: HTMLAudioElement | null = null;

  public isRecording: boolean = false;
  public accumulatedTranscript: string = '';

  // Check if browser supports Web Speech Recognition
  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  // Start real microphone recording with live Speech-to-Text transcription
  public async startRecording(
    onTranscript: (text: string) => void,
    onWaveformUpdate: (currentWaveform: number[], latestAmp: number) => void,
    onTimeUpdate: (seconds: number) => void
  ): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.recordedWaveform = [];
      this.accumulatedTranscript = '';
      this.startTime = Date.now();
      this.isRecording = true;

      // 1. Initialize Web Speech Recognition (Speech-to-Text)
      this.initSpeechRecognition(onTranscript);

      // 2. Initialize Microphone & Real-time Waveform Analyzer via Web Audio API
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
          this.mediaStream = stream;

          // Configure MediaRecorder
          let options: MediaRecorderOptions = {};
          if (typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function') {
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
              options = { mimeType: 'audio/webm;codecs=opus' };
            } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
              options = { mimeType: 'audio/mp4' };
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
              options = { mimeType: 'audio/webm' };
            } else if (MediaRecorder.isTypeSupported('audio/aac')) {
              options = { mimeType: 'audio/aac' };
            }
          }

          try {
            this.mediaRecorder = new MediaRecorder(stream, options);
          } catch (e) {
            this.mediaRecorder = new MediaRecorder(stream);
          }

          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.audioChunks.push(e.data);
            }
          };

          this.mediaRecorder.start(100);

          // AudioContext for live waveform amplitude visualization
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            this.audioContext = new AudioContextClass();
            if (this.audioContext.state === 'suspended') {
              await this.audioContext.resume();
            }

            const source = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 64;
            this.analyser.smoothingTimeConstant = 0.8;
            source.connect(this.analyser);

            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            let lastSampleTime = 0;

            const analyzeLoop = () => {
              if (!this.isRecording) return;

              this.analyser?.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              const normalized = Math.min(1.0, Math.max(0.12, avg / 90));

              const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
              onTimeUpdate(elapsedSec);

              const now = Date.now();
              if (now - lastSampleTime > 200 && this.recordedWaveform.length < 32) {
                this.recordedWaveform.push(+normalized.toFixed(2));
                lastSampleTime = now;
              }

              onWaveformUpdate([...this.recordedWaveform, normalized], normalized);
              this.animFrameId = requestAnimationFrame(analyzeLoop);
            };

            this.animFrameId = requestAnimationFrame(analyzeLoop);
          } else {
            this.startFallbackLoop(onTimeUpdate, onWaveformUpdate);
          }

          return true;
        } catch (micErr) {
          console.warn('Microphone stream notice:', micErr);
          this.startFallbackLoop(onTimeUpdate, onWaveformUpdate);
          return true;
        }
      } else {
        this.startFallbackLoop(onTimeUpdate, onWaveformUpdate);
        return true;
      }
    } catch (err) {
      console.warn('Recording start notice:', err);
      this.startFallbackLoop(onTimeUpdate, onWaveformUpdate);
      return true;
    }
  }

  // Initialize Speech Recognition with continuous accumulation and auto-reconnect
  private initSpeechRecognition(onTranscript: (text: string) => void) {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) return;

    try {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.maxAlternatives = 1;
      this.speechRecognition.lang =
        (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      this.speechRecognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            finalChunk += res[0].transcript + ' ';
          } else {
            interimChunk += res[0].transcript;
          }
        }

        if (finalChunk) {
          this.accumulatedTranscript += finalChunk;
        }

        const fullTranscript = (this.accumulatedTranscript + interimChunk).trim();
        if (fullTranscript) {
          onTranscript(fullTranscript);
        }
      };

      this.speechRecognition.onerror = (err: any) => {
        console.warn('Speech recognition notice:', err?.error || err);
      };

      this.speechRecognition.onend = () => {
        if (this.isRecording) {
          if (this.restartTimeout) clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isRecording && this.speechRecognition) {
              try {
                this.speechRecognition.start();
              } catch (e) {}
            }
          }, 150);
        }
      };

      this.speechRecognition.start();
    } catch (e) {
      console.warn('Speech recognition start notice:', e);
    }
  }

  // Standalone Dictation helper for any text input or note
  public startDictation(
    onTextUpdate: (text: string) => void,
    onStatusChange?: (isListening: boolean) => void
  ): () => void {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Safari or Chrome.');
      return () => {};
    }

    let recognitionInstance: any = null;
    let isActive = true;
    let baseText = '';

    try {
      recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang =
        (typeof navigator !== 'undefined' && navigator.language) || 'en-US';

      recognitionInstance.onstart = () => {
        onStatusChange?.(true);
      };

      recognitionInstance.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            interimChunk += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          baseText += finalChunk;
        }

        const combined = (baseText + interimChunk).trim();
        if (combined) {
          onTextUpdate(combined);
        }
      };

      recognitionInstance.onerror = (e: any) => {
        console.warn('Dictation notice:', e?.error);
      };

      recognitionInstance.onend = () => {
        if (isActive) {
          setTimeout(() => {
            if (isActive && recognitionInstance) {
              try {
                recognitionInstance.start();
              } catch (e) {}
            }
          }, 150);
        } else {
          onStatusChange?.(false);
        }
      };

      recognitionInstance.start();
    } catch (e) {
      console.warn('Dictation startup error:', e);
    }

    // Return stop function
    return () => {
      isActive = false;
      if (recognitionInstance) {
        try {
          recognitionInstance.onend = null;
          recognitionInstance.stop();
        } catch (e) {}
      }
      onStatusChange?.(false);
    };
  }

  private startFallbackLoop(
    onTimeUpdate: (sec: number) => void,
    onWaveformUpdate: (wf: number[], amp: number) => void
  ) {
    const interval = setInterval(() => {
      if (!this.isRecording) {
        clearInterval(interval);
        return;
      }
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      onTimeUpdate(elapsed);

      const fakeAmp = +(Math.random() * 0.7 + 0.25).toFixed(2);
      if (this.recordedWaveform.length < 24) {
        this.recordedWaveform.push(fakeAmp);
      }
      onWaveformUpdate([...this.recordedWaveform], fakeAmp);
    }, 250);
  }

  // Stop recording and return persistent base64 audio URL, speech transcript, duration, and waveform data
  public stopRecording(currentTranscript: string): Promise<AudioRecordingResult> {
    return new Promise((resolve) => {
      this.isRecording = false;

      if (this.restartTimeout) {
        clearTimeout(this.restartTimeout);
        this.restartTimeout = null;
      }

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }

      if (this.speechRecognition) {
        try {
          this.speechRecognition.onend = null;
          this.speechRecognition.stop();
        } catch (e) {}
        this.speechRecognition = null;
      }

      const durationSeconds = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
      const finalWaveform =
        this.recordedWaveform.length > 5
          ? this.recordedWaveform
          : [0.2, 0.4, 0.7, 0.9, 0.6, 0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3];

      const finalTranscript = (currentTranscript || this.accumulatedTranscript || '').trim();

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          // Convert Blob to permanent Base64 Data URI so it persists in storage and never breaks
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = typeof reader.result === 'string' ? reader.result : undefined;

            if (this.audioContext && this.audioContext.state !== 'closed') {
              this.audioContext.close().catch(() => {});
            }
            if (this.mediaStream) {
              this.mediaStream.getTracks().forEach((t) => t.stop());
              this.mediaStream = null;
            }

            resolve({
              audioUrl: base64Audio,
              transcript: finalTranscript,
              durationSeconds,
              waveform: finalWaveform,
            });
          };

          reader.onerror = () => {
            resolve({
              transcript: finalTranscript,
              durationSeconds,
              waveform: finalWaveform,
            });
          };

          reader.readAsDataURL(audioBlob);
        };

        try {
          this.mediaRecorder.stop();
        } catch (e) {
          resolve({
            transcript: finalTranscript,
            durationSeconds,
            waveform: finalWaveform,
          });
        }
      } else {
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((t) => t.stop());
          this.mediaStream = null;
        }
        resolve({
          transcript: finalTranscript,
          durationSeconds,
          waveform: finalWaveform,
        });
      }
    });
  }

  // Audio Playback Helpers
  public playAudio(audioUrl: string, onEnded?: () => void): HTMLAudioElement | null {
    if (typeof window === 'undefined' || !audioUrl) return null;

    try {
      this.stopAudio();
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.currentAudioElement = null;
        onEnded?.();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        onEnded?.();
      };

      audio.play().catch((err) => {
        console.warn('Audio play notice:', err);
        onEnded?.();
      });

      return audio;
    } catch (e) {
      console.warn('Audio play setup notice:', e);
      return null;
    }
  }

  public stopAudio(): void {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }
  }
}

export const speechAudioService = new SpeechAndAudioService();
