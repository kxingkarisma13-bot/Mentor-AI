// Safety Monitoring Assistant for Distress Detection

export interface DistressIndicator {
  type: 'motion' | 'speech' | 'voice_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  timestamp: number;
  data: any;
}

export interface SafetyEvent {
  id: string;
  timestamp: number;
  indicators: DistressIndicator[];
  status: 'detected' | 'confirmed' | 'false_positive' | 'emergency_activated';
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  userResponse?: 'confirmed' | 'denied' | 'no_response';
}

export class SafetyMonitoringAssistant {
  private isMonitoring = false;
  private motionDetector: MotionDistressDetector;
  private speechAnalyzer: SpeechDistressAnalyzer;
  private confirmationSystem: EmergencyConfirmationSystem;
  private emergencyAlertSystem: any; // Will be injected
  private safetyEvents: SafetyEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastMotionTime = 0;
  private motionCount = 0;
  private motionWindow = 2000; // 2 seconds
  private requiredShakes = 3;

  constructor() {
    this.motionDetector = new MotionDistressDetector();
    this.speechAnalyzer = new SpeechDistressAnalyzer();
    this.confirmationSystem = new EmergencyConfirmationSystem();
  }

  // Start continuous safety monitoring
  startMonitoring(emergencyAlertSystem: any): void {
    if (this.isMonitoring) return;

    this.emergencyAlertSystem = emergencyAlertSystem;
    this.isMonitoring = true;

    // Start motion monitoring
    this.motionDetector.startMonitoring((motionData) => {
      this.handleMotionDistress(motionData);
    });

    // Start speech monitoring
    this.speechAnalyzer.startMonitoring((speechData) => {
      this.handleSpeechDistress(speechData);
    });

    // Start continuous monitoring loop
    this.monitoringInterval = setInterval(() => {
      this.performContinuousMonitoring();
    }, 1000); // Check every second

    console.log('Safety monitoring started');
  }

  // Stop safety monitoring
  stopMonitoring(): void {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.motionDetector.stopMonitoring();
    this.speechAnalyzer.stopMonitoring();
    
    console.log('Safety monitoring stopped');
  }

  // Handle motion distress indicators
  private handleMotionDistress(motionData: any): void {
    const currentTime = Date.now();
    
    // Reset counter if too much time has passed
    if (currentTime - this.lastMotionTime > this.motionWindow) {
      this.motionCount = 0;
    }

    // Check for rapid shaking (3 times in 2 seconds)
    if (motionData.acceleration > 15) { // High acceleration threshold
      this.motionCount++;
      this.lastMotionTime = currentTime;

      if (this.motionCount >= this.requiredShakes) {
        this.createSafetyEvent('motion', 'critical', 0.9, motionData);
        this.motionCount = 0; // Reset counter
      }
    }
  }

  // Handle speech distress indicators
  private handleSpeechDistress(speechData: any): void {
    const distressLevel = this.analyzeSpeechDistress(speechData);
    
    if (distressLevel.severity !== 'low') {
      this.createSafetyEvent('speech', distressLevel.severity, distressLevel.confidence, speechData);
    }
  }

  // Analyze speech for distress indicators
  private analyzeSpeechDistress(speechData: any): { severity: string; confidence: number } {
    const text = speechData.transcript?.toLowerCase() || '';
    const audioFeatures = speechData.audioFeatures || {};

    let distressScore = 0;
    let confidence = 0;

    // Check for distress keywords
    const distressKeywords = [
      'help', 'can\'t breathe', 'can\'t breath', 'choking', 'drowning',
      'emergency', 'ambulance', 'hospital', 'pain', 'hurt', 'injured',
      'fall', 'fallen', 'stuck', 'trapped', 'fire', 'smoke'
    ];

    const urgentKeywords = [
      'can\'t breathe', 'choking', 'drowning', 'help me', 'emergency'
    ];

    // Check for repeated "help" or urgent phrases
    const helpCount = (text.match(/help/g) || []).length;
    const urgentPhrases = urgentKeywords.filter(phrase => text.includes(phrase));

    if (urgentPhrases.length > 0) {
      distressScore += 0.8;
      confidence += 0.9;
    }

    if (helpCount >= 3) {
      distressScore += 0.6;
      confidence += 0.7;
    }

    // Check for speech patterns indicating distress
    if (audioFeatures.pitchVariation > 0.5) { // High pitch variation
      distressScore += 0.3;
    }

    if (audioFeatures.volumeVariation > 0.4) { // Erratic volume
      distressScore += 0.2;
    }

    if (audioFeatures.speechRate < 0.5) { // Very slow speech (possible weakness)
      distressScore += 0.4;
    }

    // Determine severity
    let severity = 'low';
    if (distressScore >= 0.8) severity = 'critical';
    else if (distressScore >= 0.6) severity = 'high';
    else if (distressScore >= 0.4) severity = 'medium';

    return { severity, confidence: Math.min(confidence, 1.0) };
  }

  // Create safety event
  private createSafetyEvent(type: string, severity: string, confidence: number, data: any): void {
    const event: SafetyEvent = {
      id: `safety_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      indicators: [{
        type: type as any,
        severity: severity as any,
        confidence,
        timestamp: Date.now(),
        data
      }],
      status: 'detected'
    };

    this.safetyEvents.push(event);
    this.saveSafetyEvents();

    // Start confirmation process
    this.startConfirmationProcess(event);
  }

  // Start confirmation process for detected distress
  private startConfirmationProcess(event: SafetyEvent): void {
    this.confirmationSystem.startConfirmation(
      event,
      (confirmed) => {
        if (confirmed) {
          this.activateEmergencyProtocol(event);
        } else {
          event.status = 'false_positive';
          this.saveSafetyEvents();
        }
      }
    );
  }

  // Activate emergency protocol
  private async activateEmergencyProtocol(event: SafetyEvent): Promise<void> {
    try {
      // Get current location
      const location = await this.getCurrentLocation();
      event.location = location;

      // Send emergency alert
      if (this.emergencyAlertSystem) {
        await this.emergencyAlertSystem.sendDirectEmergencyAlert(
          'general',
          `Safety monitoring detected distress: ${event.indicators.map(i => i.type).join(', ')}`
        );
      }

      event.status = 'emergency_activated';
      this.saveSafetyEvents();

      console.log('Emergency protocol activated due to safety monitoring');
    } catch (error) {
      console.error('Failed to activate emergency protocol:', error);
    }
  }

  // Get current location
  private async getCurrentLocation(): Promise<{ latitude: number; longitude: number; accuracy: number } | undefined> {
    if (!navigator.geolocation) return undefined;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => resolve(undefined),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 }
      );
    });
  }

  // Perform continuous monitoring
  private performContinuousMonitoring(): void {
    // Check for patterns across multiple indicators
    const recentEvents = this.safetyEvents.filter(
      event => Date.now() - event.timestamp < 30000 // Last 30 seconds
    );

    if (recentEvents.length >= 2) {
      // Multiple distress indicators in short time
      const combinedEvent: SafetyEvent = {
        id: `combined_${Date.now()}`,
        timestamp: Date.now(),
        indicators: recentEvents.flatMap(e => e.indicators),
        status: 'detected'
      };

      this.startConfirmationProcess(combinedEvent);
    }
  }

  // Save safety events to localStorage
  private saveSafetyEvents(): void {
    try {
      localStorage.setItem('safety-events', JSON.stringify(this.safetyEvents));
    } catch (error) {
      console.error('Failed to save safety events:', error);
    }
  }

  // Load safety events from localStorage
  private loadSafetyEvents(): void {
    try {
      const saved = localStorage.getItem('safety-events');
      if (saved) {
        this.safetyEvents = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load safety events:', error);
    }
  }

  // Get safety events
  getSafetyEvents(): SafetyEvent[] {
    return [...this.safetyEvents];
  }

  // Clear safety events
  clearSafetyEvents(): void {
    this.safetyEvents = [];
    localStorage.removeItem('safety-events');
  }

  // Get monitoring status
  isActive(): boolean {
    return this.isMonitoring;
  }
}

// Motion Distress Detector
class MotionDistressDetector {
  private isMonitoring = false;
  private onDistressDetected: ((data: any) => void) | null = null;

  startMonitoring(callback: (data: any) => void): void {
    if (!('DeviceMotionEvent' in window)) {
      console.warn('Device motion not supported');
      return;
    }

    this.onDistressDetected = callback;
    this.isMonitoring = true;

    // Request permission for iOS 13+
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((response: string) => {
        if (response === 'granted') {
          window.addEventListener('devicemotion', this.handleMotion, true);
        }
      });
    } else {
      window.addEventListener('devicemotion', this.handleMotion, true);
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    window.removeEventListener('devicemotion', this.handleMotion, true);
  }

  private handleMotion = (event: DeviceMotionEvent): void => {
    if (!this.isMonitoring) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const x = acceleration.x || 0;
    const y = acceleration.y || 0;
    const z = acceleration.z || 0;

    const accelerationMagnitude = Math.sqrt(x * x + y * y + z * z);

    // Detect rapid shaking
    if (accelerationMagnitude > 15) {
      this.onDistressDetected?.({
        acceleration: accelerationMagnitude,
        x, y, z,
        timestamp: Date.now()
      });
    }
  };
}

// Speech Distress Analyzer
class SpeechDistressAnalyzer {
  private isMonitoring = false;
  private recognition: any;
  private onDistressDetected: ((data: any) => void) | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
  }

  startMonitoring(callback: (data: any) => void): void {
    if (!this.recognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    this.onDistressDetected = callback;
    this.isMonitoring = true;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      const confidence = event.results[event.results.length - 1][0].confidence;

      this.onDistressDetected?.({
        transcript,
        confidence,
        timestamp: Date.now(),
        audioFeatures: this.analyzeAudioFeatures(event)
      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    this.recognition.start();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  private analyzeAudioFeatures(event: any): any {
    // This would analyze audio features in a real implementation
    // For now, return mock data
    return {
      pitchVariation: Math.random(),
      volumeVariation: Math.random(),
      speechRate: Math.random()
    };
  }
}

// Emergency Confirmation System
class EmergencyConfirmationSystem {
  private confirmationTimeout: NodeJS.Timeout | null = null;
  private onConfirmationResult: ((confirmed: boolean) => void) | null = null;

  startConfirmation(event: SafetyEvent, callback: (confirmed: boolean) => void): void {
    this.onConfirmationResult = callback;

    // Show confirmation dialog
    this.showConfirmationDialog(event);

    // Set timeout for no response
    this.confirmationTimeout = setTimeout(() => {
      this.handleNoResponse();
    }, 10000); // 10 seconds
  }

  private showConfirmationDialog(event: SafetyEvent): void {
    // Create confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    dialog.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm">⚠️</span>
          </div>
          <h3 class="text-lg font-semibold">Safety Alert Detected</h3>
        </div>
        <p class="text-gray-600 mb-4">
          We detected signs of distress. Are you in danger?
        </p>
        <div class="flex gap-3">
          <button id="confirm-danger" class="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Yes, I need help
          </button>
          <button id="deny-danger" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            No, I'm okay
          </button>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          If you don't respond in 10 seconds, we'll activate emergency protocols.
        </p>
      </div>
    `;

    document.body.appendChild(dialog);

    // Add event listeners
    dialog.querySelector('#confirm-danger')?.addEventListener('click', () => {
      this.handleConfirmation(true);
      document.body.removeChild(dialog);
    });

    dialog.querySelector('#deny-danger')?.addEventListener('click', () => {
      this.handleConfirmation(false);
      document.body.removeChild(dialog);
    });
  }

  private handleConfirmation(confirmed: boolean): void {
    if (this.confirmationTimeout) {
      clearTimeout(this.confirmationTimeout);
      this.confirmationTimeout = null;
    }

    this.onConfirmationResult?.(confirmed);
  }

  private handleNoResponse(): void {
    // No response within 10 seconds - assume emergency
    this.handleConfirmation(true);
  }
}

