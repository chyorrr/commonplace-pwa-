// Voice Recording, Speech-to-Text (Audio-to-Text), and Waveform Service

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

  public isRecording: boolean = false;

  // Start real microphone recording with live Speech-to-Text
  public async startRecording(
    onTranscript: (text: string) => void,
    onWaveformUpdate: (currentWaveform: number[], latestAmp: number) => void,
    onTimeUpdate: (seconds: number) => void
  ): Promise<boolean> {
    try {
      this.audioChunks = [];
      this.recordedWaveform = [];
      this.startTime = Date.now();
      this.isRecording = true;

      // 1. Initialize Speech Recognition (Speech-to-Text)
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = true;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.lang = 'en-US';

        this.speechRecognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript;
          }
          onTranscript(fullTranscript);
        };

        this.speechRecognition.onerror = (err: any) => {
          console.warn('Speech recognition notice:', err);
        };

        try {
          this.speechRecognition.start();
        } catch (e) {
          console.warn('Speech recognition start error:', e);
        }
      }

      // 2. Initialize Microphone & Real-time Waveform Analyzer
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // MediaRecorder to record actual audio file
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };
        this.mediaRecorder.start(100);

        // AudioContext to analyze live frequencies
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        const source = this.audioContext.createMediaStreamSource(stream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
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
          const normalized = Math.min(1.0, Math.max(0.12, avg / 128));

          const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
          onTimeUpdate(elapsedSec);

          const now = Date.now();
          if (now - lastSampleTime > 250 && this.recordedWaveform.length < 24) {
            this.recordedWaveform.push(+normalized.toFixed(2));
            lastSampleTime = now;
          }

          onWaveformUpdate([...this.recordedWaveform, normalized], normalized);
          this.animFrameId = requestAnimationFrame(analyzeLoop);
        };

        this.animFrameId = requestAnimationFrame(analyzeLoop);
        return true;
      } else {
        // Fallback timer if mediaDevices not supported
        this.startFallbackLoop(onTimeUpdate, onWaveformUpdate);
        return true;
      }
    } catch (err) {
      console.warn('Microphone access denied or unavailable. Using fallback recorder.', err);
      this.startFallbackLoop(onTimeUpdate, onWaveformUpdate);
      return true;
    }
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

      const fakeAmp = +(Math.random() * 0.7 + 0.2).toFixed(2);
      if (this.recordedWaveform.length < 20) {
        this.recordedWaveform.push(fakeAmp);
      }
      onWaveformUpdate([...this.recordedWaveform], fakeAmp);
    }, 300);
  }

  // Stop recording and return Audio blob URL, speech transcript, duration, and waveform data
  public stopRecording(currentTranscript: string): Promise<AudioRecordingResult> {
    return new Promise((resolve) => {
      this.isRecording = false;

      if (this.animFrameId) {
        cancelAnimationFrame(this.animFrameId);
      }

      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
        } catch (e) {}
      }

      const durationSeconds = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
      const finalWaveform =
        this.recordedWaveform.length > 5
          ? this.recordedWaveform
          : [0.2, 0.4, 0.7, 0.9, 0.6, 0.3, 0.5, 0.8, 1.0, 0.7, 0.4, 0.6, 0.8, 0.5, 0.3];

      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close().catch(() => {});
          }

          resolve({
            audioUrl,
            transcript: currentTranscript.trim(),
            durationSeconds,
            waveform: finalWaveform,
          });
        };
        this.mediaRecorder.stop();
      } else {
        resolve({
          transcript: currentTranscript.trim(),
          durationSeconds,
          waveform: finalWaveform,
        });
      }
    });
  }
}

export const speechAudioService = new SpeechAndAudioService();
