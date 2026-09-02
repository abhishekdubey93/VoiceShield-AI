export class AudioService {
  private audioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  public async requestMicrophone(): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported in this browser environment.');
    }
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.initAudioContext(this.mediaStream);
    return this.mediaStream;
  }

  private initAudioContext(stream: MediaStream): void {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256;
    this.source = this.audioCtx.createMediaStreamSource(stream);
    this.source.connect(this.analyser);
  }

  public getAudioFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getAudioLevel(): number {
    const data = this.getAudioFrequencyData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return Math.round((sum / data.length) / 2.55); // 0 - 100%
  }

  public stopAudioStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
    this.source = null;
  }

  public isMicrophoneActive(): boolean {
    return !!this.mediaStream && this.mediaStream.active;
  }
}

export const audioService = new AudioService();
