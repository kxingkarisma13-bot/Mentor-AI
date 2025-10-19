export type ShakeConfig = {
  thresholdG?: number;
  windowMs?: number;
  requiredShakes?: number;
  cooldownMs?: number;
};

export type ShakeCallback = () => void;

const DEFAULTS: Required<ShakeConfig> = {
  thresholdG: 2.2,
  windowMs: 800,
  requiredShakes: 3,
  cooldownMs: 4000,
};

export class ShakeDetector {
  private lastTimestampMs = 0;
  private consecutiveShakes = 0;
  private coolingDown = false;
  private readonly config: Required<ShakeConfig>;
  private readonly onShake: ShakeCallback;
  private boundHandler?: (e: DeviceMotionEvent) => void;

  constructor(onShake: ShakeCallback, config?: ShakeConfig) {
    this.onShake = onShake;
    this.config = { ...DEFAULTS, ...(config || {}) };
  }

  async enable(): Promise<void> {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        await (DeviceMotionEvent as any).requestPermission();
      } catch (err) {
        console.warn('Motion permission denied:', err);
      }
    }

    this.boundHandler = (e: DeviceMotionEvent) => this.handleMotion(e);
    window.addEventListener('devicemotion', this.boundHandler as any, { passive: true } as any);
  }

  disable(): void {
    if (this.boundHandler) {
      window.removeEventListener('devicemotion', this.boundHandler as any);
      this.boundHandler = undefined;
    }
  }

  private handleMotion(e: DeviceMotionEvent): void {
    const a: any = (e as any).accelerationIncludingGravity || (e as any).acceleration;
    if (!a) return;
    const g = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2) / 9.80665;
    const now = performance.now();

    if (g > this.config.thresholdG) {
      if (now - this.lastTimestampMs < this.config.windowMs) this.consecutiveShakes++;
      else this.consecutiveShakes = 1;
      this.lastTimestampMs = now;

      if (!this.coolingDown && this.consecutiveShakes >= this.config.requiredShakes) {
        this.coolingDown = true;
        this.consecutiveShakes = 0;
        try {
          this.onShake();
        } finally {
          setTimeout(() => (this.coolingDown = false), this.config.cooldownMs);
        }
      }
    }
  }
}


