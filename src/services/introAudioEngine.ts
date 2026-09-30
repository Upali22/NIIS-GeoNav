/**
 * NIIS GeoNav - Sci-Fi Quantum Boot & Sonic Charge Sound Effect Engine
 * Pure Web Audio API procedural sound design with zero external dependencies.
 * Creates an electrifying, surprising power-up sonic experience on website open.
 */

class IntroSoundEffectEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private isMutedState: boolean = false;
  private currentVolume: number = 0.85;
  private audioDataArray: Uint8Array<ArrayBuffer> | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private hasPlayedStartup: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Gain Node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMutedState ? 0 : this.currentVolume, this.ctx.currentTime);

        // Real-time Analyser for live visualizer feedback
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;
        this.audioDataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

        // Spatial Stereo Delay Line
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.value = 0.22;
        this.delayFeedback = this.ctx.createGain();
        this.delayFeedback.gain.value = 0.32;

        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode);
        this.delayFeedback.connect(this.masterGain);

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    return this.ctx;
  }

  /**
   * Resumes AudioContext if suspended by browser autoplay policy
   */
  public async unlock(): Promise<boolean> {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
        const isRunning = (ctx.state as string) === 'running';
        if (isRunning && !this.hasPlayedStartup) {
          this.playPowerUpSoundEffect();
        }
        return isRunning;
      } catch {
        return false;
      }
    }
    return (ctx?.state as string) === 'running';
  }

  public isUnlocked(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  /**
   * The Main Surprising Sci-Fi Loading Sound Effect:
   * 1. Sub-bass sonic boom impact
   * 2. Quantum turbine charging sweep (rising frequency with resonant harmonics)
   * 3. Digital telemetry data chirps
   * 4. Multi-frequency cosmic shimmer
   */
  public playPowerUpSoundEffect(): void {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain || this.isMutedState) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.hasPlayedStartup = true;
    const now = ctx.currentTime;

    // --- LAYER 1: Deep Sonic Boom Impact (Sub Drop) ---
    try {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(36, now + 0.55);

      subGain.gain.setValueAtTime(0.35, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.9);
      this.activeOscillators.push(subOsc);
    } catch {}

    // --- LAYER 2: Electric Spark / Ionization Pulse ---
    try {
      const zapOsc = ctx.createOscillator();
      const zapFilter = ctx.createBiquadFilter();
      const zapGain = ctx.createGain();

      zapOsc.type = 'sawtooth';
      zapOsc.frequency.setValueAtTime(800, now);
      zapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.18);

      zapFilter.type = 'bandpass';
      zapFilter.frequency.setValueAtTime(1800, now);
      zapFilter.Q.setValueAtTime(4, now);

      zapGain.gain.setValueAtTime(0.18, now);
      zapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      zapOsc.connect(zapFilter);
      zapFilter.connect(zapGain);
      zapGain.connect(this.masterGain);
      zapOsc.start(now);
      zapOsc.stop(now + 0.25);
    } catch {}

    // --- LAYER 3: Quantum Reactor Turbine Charge-Up (Rising Pitch Sweep) ---
    try {
      const chargeOsc1 = ctx.createOscillator();
      const chargeOsc2 = ctx.createOscillator();
      const chargeFilter = ctx.createBiquadFilter();
      const chargeGain = ctx.createGain();

      // Dual detuned oscillators for thick sci-fi jet turbine sound
      chargeOsc1.type = 'sawtooth';
      chargeOsc1.frequency.setValueAtTime(65, now + 0.1);
      chargeOsc1.frequency.exponentialRampToValueAtTime(880, now + 3.2);

      chargeOsc2.type = 'triangle';
      chargeOsc2.frequency.setValueAtTime(68, now + 0.1);
      chargeOsc2.frequency.exponentialRampToValueAtTime(892, now + 3.2);

      // Resonant Lowpass filter sweeping upwards with the frequency
      chargeFilter.type = 'lowpass';
      chargeFilter.frequency.setValueAtTime(220, now + 0.1);
      chargeFilter.frequency.exponentialRampToValueAtTime(3600, now + 3.2);
      chargeFilter.Q.setValueAtTime(3.5, now + 0.1);

      // Envelope: swelling during load
      chargeGain.gain.setValueAtTime(0.001, now);
      chargeGain.gain.linearRampToValueAtTime(0.12, now + 0.4);
      chargeGain.gain.linearRampToValueAtTime(0.18, now + 2.5);
      chargeGain.gain.exponentialRampToValueAtTime(0.001, now + 3.3);

      chargeOsc1.connect(chargeFilter);
      chargeOsc2.connect(chargeFilter);
      chargeFilter.connect(chargeGain);
      chargeGain.connect(this.masterGain);

      chargeOsc1.start(now + 0.1);
      chargeOsc2.start(now + 0.1);
      chargeOsc1.stop(now + 3.4);
      chargeOsc2.stop(now + 3.4);
    } catch {}

    // --- LAYER 4: High-frequency Cyber Shimmer & Digital Chirps ---
    [0.6, 1.2, 1.8, 2.4].forEach((timeOffset, idx) => {
      try {
        const pingOsc = ctx.createOscillator();
        const pingGain = ctx.createGain();

        pingOsc.type = 'sine';
        const baseFreq = 950 + idx * 260;
        pingOsc.frequency.setValueAtTime(baseFreq, now + timeOffset);
        pingOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + timeOffset + 0.1);

        pingGain.gain.setValueAtTime(0.06, now + timeOffset);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.25);

        pingOsc.connect(pingGain);
        pingGain.connect(this.masterGain!);

        if (this.delayNode) {
          pingGain.connect(this.delayNode);
        }

        pingOsc.start(now + timeOffset);
        pingOsc.stop(now + timeOffset + 0.3);
      } catch {}
    });
  }

  /**
   * Telemetry Milestone Target Lock SFX (Triggered at 25%, 50%, 75%, 100%)
   */
  public playMilestoneLockSfx(phaseIndex: number): void {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain || this.isMutedState) return;

    const now = ctx.currentTime;
    const baseFreqs = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
    const freq = baseFreqs[Math.min(phaseIndex, baseFreqs.length - 1)];

    try {
      // 1. Crisp Metallic Telemetry Click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(freq * 1.8, now);
      clickOsc.frequency.exponentialRampToValueAtTime(freq, now + 0.08);

      clickGain.gain.setValueAtTime(0.12, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(now);
      clickOsc.stop(now + 0.15);

      // 2. Harmonic Resonance Ring
      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(freq, now);

      ringGain.gain.setValueAtTime(0.08, now);
      ringGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      ringOsc.connect(ringGain);
      ringGain.connect(this.masterGain);

      if (this.delayNode) {
        ringGain.connect(this.delayNode);
      }

      ringOsc.start(now);
      ringOsc.stop(now + 0.6);
    } catch {}
  }

  /**
   * Final System Online & Warp Flare SFX (100% calibration / Enter Campus)
   */
  public playSystemOnlineWarpSfx(): void {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain || this.isMutedState) return;

    const now = ctx.currentTime;

    try {
      // 1. Power surge sub thump
      const thumpOsc = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thumpOsc.type = 'sine';
      thumpOsc.frequency.setValueAtTime(140, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      thumpGain.gain.setValueAtTime(0.3, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(this.masterGain);
      thumpOsc.start(now);
      thumpOsc.stop(now + 0.45);

      // 2. Celestial Triumphant Chord Stinger (D Major: D5, F#5, A5, D6)
      const chord = [587.33, 739.99, 880.00, 1174.66];
      chord.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.04);

        gain.gain.setValueAtTime(0.001, now + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.09, now + i * 0.04 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        if (this.delayNode) {
          gain.connect(this.delayNode);
        }

        osc.start(now + i * 0.04);
        osc.stop(now + 1.3);
      });

      // 3. High-velocity Warp Sweep
      const warpOsc = ctx.createOscillator();
      const warpFilter = ctx.createBiquadFilter();
      const warpGain = ctx.createGain();

      warpOsc.type = 'sawtooth';
      warpOsc.frequency.setValueAtTime(220, now);
      warpOsc.frequency.exponentialRampToValueAtTime(2400, now + 0.4);

      warpFilter.type = 'bandpass';
      warpFilter.frequency.setValueAtTime(600, now);
      warpFilter.frequency.exponentialRampToValueAtTime(3200, now + 0.4);
      warpFilter.Q.setValueAtTime(2, now);

      warpGain.gain.setValueAtTime(0.12, now);
      warpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      warpOsc.connect(warpFilter);
      warpFilter.connect(warpGain);
      warpGain.connect(this.masterGain);

      warpOsc.start(now);
      warpOsc.stop(now + 0.55);
    } catch {}
  }

  /**
   * Interactive UI button click / tap feedback
   */
  public playClickSfx(): void {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain || this.isMutedState) return;

    const now = ctx.currentTime;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  /**
   * Real-time audio frequency data for visualizer
   */
  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.audioDataArray && !this.isMutedState) {
      this.analyser.getByteFrequencyData(this.audioDataArray);
      return this.audioDataArray;
    }
    return new Uint8Array(new ArrayBuffer(32));
  }

  public setVolume(val: number): void {
    this.currentVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMutedState ? 0 : this.currentVolume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.05);
    }
  }

  public getVolume(): number {
    return this.currentVolume;
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMutedState ? 0 : this.currentVolume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.08);
    }
    return this.isMutedState;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public stop(): void {
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.activeOscillators = [];

    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      } catch {}
    }
  }
}

// Singleton export
export const introAudioEngine = new IntroSoundEffectEngine();
