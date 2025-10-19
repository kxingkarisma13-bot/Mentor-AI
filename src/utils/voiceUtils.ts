// Voice recognition and synthesis utilities

import { AdvancedVoiceProcessor, EnhancedVoiceRecognition } from './voiceProcessor';

export class VoiceRecognition {
  private recognition: any;
  private isListening = false;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  start(onResult: (transcript: string) => void, onError?: (error: string) => void): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    if (this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError?.('Failed to start voice recognition');
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

// Enhanced Voice Activation with Wake Word Detection
export class VoiceActivation {
  private recognition: any;
  private isListening = false;
  private isActivated = false;
  private wakeWord = 'hey mento';
  private onWakeWordDetected: (() => void) | null = null;
  private onSpeechResult: ((transcript: string) => void) | null = null;
  private onError: ((error: string) => void) | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  startWakeWordDetection(
    onWakeWordDetected: () => void,
    onError?: (error: string) => void
  ): void {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser');
      return;
    }

    this.onWakeWordDetected = onWakeWordDetected;
    this.onError = onError;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      
      if (transcript.includes(this.wakeWord) && !this.isActivated) {
        this.isActivated = true;
        this.onWakeWordDetected?.();
        this.startContinuousListening();
      }
    };

    this.recognition.onerror = (event: any) => {
      this.onError?.(event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // Restart if we were listening for wake word
      if (!this.isActivated) {
        setTimeout(() => this.startWakeWordDetection(onWakeWordDetected, onError), 100);
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      this.onError?.('Failed to start wake word detection');
    }
  }

  startContinuousListening(): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      if (transcript.trim()) {
        this.onSpeechResult?.(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.onError?.(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.isActivated = false;
    };
  }

  setSpeechHandlers(
    onSpeechResult: (transcript: string) => void,
    onError?: (error: string) => void
  ): void {
    this.onSpeechResult = onSpeechResult;
    this.onError = onError;
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.isActivated = false;
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  getIsActivated(): boolean {
    return this.isActivated;
  }
}

// Enhanced Voice Recognition with Advanced Processing
export class EnhancedVoiceRecognitionWrapper {
  private voiceProcessor: AdvancedVoiceProcessor;
  private enhancedRecognition: EnhancedVoiceRecognition;
  private isListening = false;

  constructor() {
    this.voiceProcessor = new AdvancedVoiceProcessor();
    this.enhancedRecognition = new EnhancedVoiceRecognition(this.voiceProcessor);
  }

  isSupported(): boolean {
    return !!(window.webkitSpeechRecognition || window.SpeechRecognition);
  }

  async start(
    onResult: (transcript: string) => void,
    onError?: (error: string) => void,
    onClarification?: (message: string) => void
  ): Promise<boolean> {
    if (!this.isSupported()) {
      onError?.('Speech recognition not supported in this browser');
      return false;
    }

    try {
      const success = await this.enhancedRecognition.start(
        (transcript, confidence) => {
          onResult(transcript);
        },
        onError,
        onClarification
      );

      this.isListening = success;
      return success;
    } catch (error) {
      onError?.('Failed to start enhanced voice recognition');
      return false;
    }
  }

  stop(): void {
    this.enhancedRecognition.stop();
    this.isListening = false;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  // Update voice processing settings
  updateSettings(settings: any): void {
    this.enhancedRecognition.updateSettings(settings);
  }

  // Get current settings
  getSettings(): any {
    return this.voiceProcessor.getSettings();
  }
}

// Emergency Shake Detection
export class EmergencyShakeDetector {
  private isEnabled = false;
  private lastShakeTime = 0;
  private shakeThreshold = 15; // Sensitivity for shake detection
  private shakeTimeout = 1000; // Time between shakes (ms)
  private requiredShakes = 3; // Number of shakes to trigger emergency
  private shakeCount = 0;
  private onEmergencyTriggered: (() => void) | null = null;

  constructor() {
    this.handleShake = this.handleShake.bind(this);
  }

  start(onEmergencyTriggered: () => void): void {
    if (!('DeviceMotionEvent' in window)) {
      console.warn('Device motion not supported');
      return;
    }

    this.onEmergencyTriggered = onEmergencyTriggered;
    this.isEnabled = true;
    this.shakeCount = 0;
    
    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', this.handleShake, true);
        }
      });
    } else {
      window.addEventListener('devicemotion', this.handleShake, true);
    }
  }

  stop(): void {
    this.isEnabled = false;
    window.removeEventListener('devicemotion', this.handleShake, true);
  }

  private handleShake(event: DeviceMotionEvent): void {
    if (!this.isEnabled) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const x = acceleration.x || 0;
    const y = acceleration.y || 0;
    const z = acceleration.z || 0;

    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);
    const currentTime = Date.now();

    if (accelerationMagnitude > this.shakeThreshold) {
      if (currentTime - this.lastShakeTime > this.shakeTimeout) {
        this.shakeCount = 1;
      } else {
        this.shakeCount++;
      }

      this.lastShakeTime = currentTime;

      if (this.shakeCount >= this.requiredShakes) {
        this.triggerEmergency();
        this.shakeCount = 0;
      }
    }
  }

  private triggerEmergency(): void {
    this.onEmergencyTriggered?.();
  }

  isSupported(): boolean {
    return 'DeviceMotionEvent' in window;
  }
}

// Emergency Alarm System
export class EmergencyAlarm {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private alarmTimeout: NodeJS.Timeout | null = null;
  private duration = 60000; // 1 minute in milliseconds

  constructor() {
    // Initialize audio context on user interaction
    this.initializeAudioContext();
  }

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
    }
  }

  startAlarm(): void {
    if (this.isPlaying) return;

    // Initialize audio context if not already done
    if (!this.audioContext) {
      this.initializeAudioContext();
    }

    if (!this.audioContext) {
      console.warn('AudioContext not available for alarm');
      return;
    }

    try {
      // Resume audio context if suspended (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Create oscillator for alarm sound
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      // Configure alarm sound (high-pitched, attention-grabbing)
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      
      // Create pulsing effect
      this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      this.oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.1);
      this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);

      // Set volume
      this.gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);

      // Connect nodes
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Start the alarm
      this.oscillator.start();
      this.isPlaying = true;

      // Create pulsing effect every 0.5 seconds
      this.createPulsingEffect();

      // Auto-stop after 1 minute
      this.alarmTimeout = setTimeout(() => {
        this.stopAlarm();
      }, this.duration);

      console.log('Emergency alarm started');
    } catch (error) {
      console.error('Failed to start alarm:', error);
    }
  }

  private createPulsingEffect(): void {
    if (!this.audioContext || !this.gainNode || !this.isPlaying) return;

    const pulseInterval = setInterval(() => {
      if (!this.isPlaying) {
        clearInterval(pulseInterval);
        return;
      }

      // Create pulsing volume effect
      this.gainNode!.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
      this.gainNode!.gain.linearRampToValueAtTime(0.5, this.audioContext!.currentTime + 0.1);
      this.gainNode!.gain.linearRampToValueAtTime(0.1, this.audioContext!.currentTime + 0.2);
    }, 500);
  }

  stopAlarm(): void {
    if (!this.isPlaying) return;

    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }

      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }

      if (this.alarmTimeout) {
        clearTimeout(this.alarmTimeout);
        this.alarmTimeout = null;
      }

      this.isPlaying = false;
      console.log('Emergency alarm stopped');
    } catch (error) {
      console.error('Error stopping alarm:', error);
    }
  }

  isAlarmPlaying(): boolean {
    return this.isPlaying;
  }

  isSupported(): boolean {
    return !!(window.AudioContext || (window as any).webkitAudioContext);
  }
}

export class VoiceSynthesis {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  isSupported(): boolean {
    return !!this.synth;
  }

  speak(text: string, voice?: SpeechSynthesisVoice): void {
    if (!this.synth) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  getVoices(): SpeechSynthesisVoice[] {
    return this.synth?.getVoices() || [];
  }

  isSpeaking(): boolean {
    return this.synth?.speaking || false;
  }
}
