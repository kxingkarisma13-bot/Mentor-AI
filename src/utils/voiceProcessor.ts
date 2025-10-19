// Advanced Voice Processing with Sensitivity Control

export interface AudioAnalysis {
  decibelLevel: number;
  isSpeech: boolean;
  confidence: number;
  hasWakeWord: boolean;
  intent: string | null;
  isIntentional: boolean;
  noiseLevel: number;
  clarity: number;
}

export interface VoiceSettings {
  decibelThreshold: number; // Default: 60 dB
  confidenceThreshold: number; // Default: 0.8
  noiseReduction: boolean;
  wakeWordRequired: boolean;
  intentDetection: boolean;
  clarificationEnabled: boolean;
}

export class AdvancedVoiceProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private isProcessing = false;
  private settings: VoiceSettings;
  private onVoiceDetected: ((analysis: AudioAnalysis) => void) | null = null;
  private onClarificationNeeded: ((message: string) => void) | null = null;

  // Wake words and intent patterns
  private wakeWords = ['hey mento', 'mentor ai', 'ai mentor', 'hey mentor'];
  private intentKeywords = [
    'help', 'question', 'advice', 'guidance', 'support',
    'emergency', 'urgent', 'important', 'need', 'want'
  ];
  private nonIntentionalPatterns = [
    'um', 'uh', 'like', 'you know', 'so', 'well',
    'cough', 'sneeze', 'breathing', 'background'
  ];

  constructor(settings?: Partial<VoiceSettings>) {
    this.settings = {
      decibelThreshold: 60,
      confidenceThreshold: 0.8,
      noiseReduction: true,
      wakeWordRequired: true,
      intentDetection: true,
      clarificationEnabled: true,
      ...settings
    };
  }

  // Initialize audio processing
  async initializeAudio(): Promise<boolean> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      this.stream = stream;
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);

      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  // Start voice processing
  startProcessing(
    onVoiceDetected: (analysis: AudioAnalysis) => void,
    onClarificationNeeded?: (message: string) => void
  ): void {
    if (!this.analyser) {
      console.error('Audio not initialized');
      return;
    }

    this.onVoiceDetected = onVoiceDetected;
    this.onClarificationNeeded = onClarificationNeeded;
    this.isProcessing = true;

    this.processAudio();
  }

  // Stop voice processing
  stopProcessing(): void {
    this.isProcessing = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  // Main audio processing loop
  private processAudio(): void {
    if (!this.isProcessing || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate decibel level
    const decibelLevel = this.calculateDecibelLevel(dataArray);
    
    // Only process if above threshold
    if (decibelLevel > this.settings.decibelThreshold) {
      const analysis = this.analyzeAudio(dataArray, decibelLevel);
      
      if (analysis.isIntentional && analysis.confidence >= this.settings.confidenceThreshold) {
        this.onVoiceDetected?.(analysis);
      } else if (analysis.isSpeech && !analysis.isIntentional) {
        this.handleAmbiguousInput(analysis);
      }
    }

    // Continue processing
    requestAnimationFrame(() => this.processAudio());
  }

  // Calculate decibel level from frequency data
  private calculateDecibelLevel(dataArray: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    return 20 * Math.log10(rms + 1e-10); // Convert to dB
  }

  // Analyze audio for speech characteristics
  private analyzeAudio(dataArray: Uint8Array, decibelLevel: number): AudioAnalysis {
    const frequencyData = this.analyzeFrequencySpectrum(dataArray);
    const isSpeech = this.detectSpeech(frequencyData, decibelLevel);
    const noiseLevel = this.calculateNoiseLevel(dataArray);
    const clarity = this.calculateClarity(frequencyData);
    
    return {
      decibelLevel,
      isSpeech,
      confidence: this.calculateConfidence(frequencyData, decibelLevel, clarity),
      hasWakeWord: false, // Will be set by speech recognition
      intent: null, // Will be set by speech recognition
      isIntentional: false, // Will be determined by analysis
      noiseLevel,
      clarity
    };
  }

  // Analyze frequency spectrum for speech characteristics
  private analyzeFrequencySpectrum(dataArray: Uint8Array): {
    dominantFreq: number;
    spectralCentroid: number;
    spectralRolloff: number;
    zeroCrossingRate: number;
  } {
    let sum = 0;
    let weightedSum = 0;
    let rolloffSum = 0;
    let zeroCrossings = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const magnitude = dataArray[i];
      sum += magnitude;
      weightedSum += i * magnitude;
      
      if (i > 0) {
        if ((dataArray[i] > 0) !== (dataArray[i-1] > 0)) {
          zeroCrossings++;
        }
      }
    }

    const spectralCentroid = sum > 0 ? weightedSum / sum : 0;
    const spectralRolloff = this.calculateSpectralRolloff(dataArray);
    const zeroCrossingRate = zeroCrossings / dataArray.length;

    return {
      dominantFreq: spectralCentroid,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate
    };
  }

  // Calculate spectral rolloff (frequency below which 85% of energy lies)
  private calculateSpectralRolloff(dataArray: Uint8Array): number {
    const totalEnergy = dataArray.reduce((sum, val) => sum + val * val, 0);
    const threshold = 0.85 * totalEnergy;
    let cumulativeEnergy = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      cumulativeEnergy += dataArray[i] * dataArray[i];
      if (cumulativeEnergy >= threshold) {
        return i / dataArray.length;
      }
    }
    return 1.0;
  }

  // Detect if audio contains speech
  private detectSpeech(frequencyData: any, decibelLevel: number): boolean {
    // Speech typically has:
    // - Dominant frequency between 85-255 Hz (fundamental frequency)
    // - Spectral centroid between 1000-4000 Hz
    // - Moderate zero-crossing rate
    // - Sufficient energy level

    const isInSpeechRange = frequencyData.dominantFreq > 85 && frequencyData.dominantFreq < 255;
    const hasSpeechCentroid = frequencyData.spectralCentroid > 1000 && frequencyData.spectralCentroid < 4000;
    const hasModerateZCR = frequencyData.zeroCrossingRate > 0.1 && frequencyData.zeroCrossingRate < 0.5;
    const hasSufficientEnergy = decibelLevel > this.settings.decibelThreshold;

    return isInSpeechRange && hasSpeechCentroid && hasModerateZCR && hasSufficientEnergy;
  }

  // Calculate noise level
  private calculateNoiseLevel(dataArray: Uint8Array): number {
    // Calculate standard deviation as noise indicator
    const mean = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    const variance = dataArray.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dataArray.length;
    return Math.sqrt(variance);
  }

  // Calculate speech clarity
  private calculateClarity(frequencyData: any): number {
    // Higher clarity = more distinct speech characteristics
    const spectralCentroid = frequencyData.spectralCentroid;
    const spectralRolloff = frequencyData.spectralRolloff;
    
    // Optimal speech has centroid around 2000 Hz and rolloff around 0.6
    const centroidScore = 1 - Math.abs(spectralCentroid - 2000) / 2000;
    const rolloffScore = 1 - Math.abs(spectralRolloff - 0.6) / 0.6;
    
    return Math.max(0, Math.min(1, (centroidScore + rolloffScore) / 2));
  }

  // Calculate overall confidence score
  private calculateConfidence(frequencyData: any, decibelLevel: number, clarity: number): number {
    const speechScore = this.detectSpeech(frequencyData, decibelLevel) ? 1 : 0;
    const energyScore = Math.min(1, decibelLevel / 80); // Normalize to 0-1
    const clarityScore = clarity;
    
    // Weighted combination
    return (speechScore * 0.4 + energyScore * 0.3 + clarityScore * 0.3);
  }

  // Handle ambiguous or unclear input
  private handleAmbiguousInput(analysis: AudioAnalysis): void {
    if (!this.settings.clarificationEnabled) return;

    const clarificationMessages = [
      "I heard you speak, but I'm not sure what you need. Could you please repeat that?",
      "I detected speech but couldn't understand clearly. Can you speak a bit louder and clearer?",
      "I'm not sure what you said. Could you please rephrase that?",
      "I heard some audio but couldn't make out the words. Can you try again?"
    ];

    const randomMessage = clarificationMessages[Math.floor(Math.random() * clarificationMessages.length)];
    this.onClarificationNeeded?.(randomMessage);
  }

  // Process speech recognition result
  processSpeechResult(transcript: string, confidence: number): AudioAnalysis {
    const hasWakeWord = this.detectWakeWord(transcript);
    const intent = this.detectIntent(transcript);
    const isIntentional = this.isIntentionalSpeech(transcript, confidence);

    return {
      decibelLevel: 0, // Will be filled by audio analysis
      isSpeech: true,
      confidence,
      hasWakeWord,
      intent,
      isIntentional,
      noiseLevel: 0,
      clarity: confidence
    };
  }

  // Detect wake words in transcript
  private detectWakeWord(transcript: string): boolean {
    const lowerTranscript = transcript.toLowerCase();
    return this.wakeWords.some(wakeWord => lowerTranscript.includes(wakeWord));
  }

  // Detect intent in speech
  private detectIntent(transcript: string): string | null {
    const lowerTranscript = transcript.toLowerCase();
    
    for (const keyword of this.intentKeywords) {
      if (lowerTranscript.includes(keyword)) {
        return keyword;
      }
    }
    
    return null;
  }

  // Determine if speech is intentional
  private isIntentionalSpeech(transcript: string, confidence: number): boolean {
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for non-intentional patterns
    const hasNonIntentionalPattern = this.nonIntentionalPatterns.some(pattern => 
      lowerTranscript.includes(pattern)
    );
    
    // Must have sufficient confidence and not be non-intentional
    return confidence >= this.settings.confidenceThreshold && !hasNonIntentionalPattern;
  }

  // Update settings
  updateSettings(newSettings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  // Get current settings
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  // Check if processing is active
  isActive(): boolean {
    return this.isProcessing;
  }
}

// Enhanced Voice Recognition with Advanced Processing
export class EnhancedVoiceRecognition {
  private recognition: any;
  private voiceProcessor: AdvancedVoiceProcessor;
  private isListening = false;
  private onResult: ((transcript: string, confidence: number) => void) | null = null;
  private onError: ((error: string) => void) | null = null;
  private onClarification: ((message: string) => void) | null = null;

  constructor(voiceProcessor: AdvancedVoiceProcessor) {
    this.voiceProcessor = voiceProcessor;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  // Start enhanced voice recognition
  async start(
    onResult: (transcript: string, confidence: number) => void,
    onError?: (error: string) => void,
    onClarification?: (message: string) => void
  ): Promise<boolean> {
    if (!this.recognition) {
      onError?.('Speech recognition not supported');
      return false;
    }

    // Initialize audio processing
    const audioInitialized = await this.voiceProcessor.initializeAudio();
    if (!audioInitialized) {
      onError?.('Failed to initialize audio processing');
      return false;
    }

    this.onResult = onResult;
    this.onError = onError;
    this.onClarification = onClarification;

    // Start audio processing
    this.voiceProcessor.startProcessing(
      (analysis) => this.handleAudioAnalysis(analysis),
      (message) => this.onClarification?.(message)
    );

    // Configure speech recognition
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const confidence = event.results[event.results.length - 1][0].confidence;
      
      const processedResult = this.voiceProcessor.processSpeechResult(transcript, confidence);
      
      if (processedResult.isIntentional) {
        this.onResult?.(transcript, confidence);
      } else if (processedResult.isSpeech) {
        this.onClarification?.("I heard you speak, but I'm not sure what you need. Could you please be more specific?");
      }
    };

    this.recognition.onerror = (event: any) => {
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      this.onError?.('Failed to start voice recognition');
      return false;
    }
  }

  // Handle audio analysis from voice processor
  private handleAudioAnalysis(analysis: AudioAnalysis): void {
    // Only process if audio meets our criteria
    if (analysis.isSpeech && analysis.confidence >= this.voiceProcessor.getSettings().confidenceThreshold) {
      // Audio is ready for speech recognition processing
      // The speech recognition will handle the actual transcript processing
    }
  }

  // Stop voice recognition
  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    
    this.voiceProcessor.stopProcessing();
  }

  // Check if listening
  isActive(): boolean {
    return this.isListening;
  }

  // Update voice processor settings
  updateSettings(settings: Partial<VoiceSettings>): void {
    this.voiceProcessor.updateSettings(settings);
  }
}

