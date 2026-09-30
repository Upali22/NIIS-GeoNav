class VoiceGuidanceService {
  private enabled: boolean = true;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;

  constructor() {
    const saved = localStorage.getItem('niis_voice_guidance');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('niis_voice_guidance', String(this.enabled));
    if (!this.enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else if (this.enabled) {
      this.speak('Voice guidance enabled.');
    }
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    localStorage.setItem('niis_voice_guidance', String(val));
    if (!val && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public speak(text: string, force: boolean = false) {
    if (!this.enabled) return;
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    if (!force && text === this.lastSpokenText && now - this.lastSpokenTime < 5000) {
      return; // prevent duplicate repetition within 5s
    }

    this.lastSpokenText = text;
    this.lastSpokenTime = now;

    try {
      window.speechSynthesis.cancel(); // cancel pending speech for prompt response
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.lang = 'en-IN'; // Indian English cadence suited for Odisha campus navigation

      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
      if (inVoice) {
        utterance.voice = inVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const voiceGuidance = new VoiceGuidanceService();
