// Audio Service for Ding-Dong Chime and Indonesian Text-to-Speech (TTS)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a crystal-clear melodic airport/office chime using Web Audio API
 */
export async function playChime(volumePercent: number = 85): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const gainNode = ctx.createGain();
      const masterVol = Math.max(0.01, Math.min(1.0, volumePercent / 100));
      gainNode.gain.setValueAtTime(masterVol * 0.4, ctx.currentTime);
      gainNode.connect(ctx.destination);

      // Chime frequencies: F5 (698.46Hz), A5 (880Hz), C6 (1046.5Hz)
      const tones = [
        { freq: 523.25, time: 0.0, dur: 0.35 },  // C5
        { freq: 659.25, time: 0.28, dur: 0.35 }, // E5
        { freq: 783.99, time: 0.55, dur: 0.65 }, // G5
      ];

      tones.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        // Gentle envelope attack and decay
        const startTime = ctx.currentTime + time;
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(masterVol * 0.5, startTime + 0.04);
        noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });

      setTimeout(() => {
        resolve();
      }, 1100);
    } catch (e) {
      console.warn('Audio chime playback failed:', e);
      resolve();
    }
  });
}

/**
 * Convert ticket number like 'A-005' to clear Indonesian spoken words:
 * "A - Nol - Nol - Lima"
 */
export function formatSpokenTicket(ticketNumber: string): string {
  const parts = ticketNumber.split('-');
  const letter = parts[0] || '';
  const numPart = parts[1] || '';

  const digitMap: Record<string, string> = {
    '0': 'Nol',
    '1': 'Satu',
    '2': 'Dua',
    '3': 'Tiga',
    '4': 'Empat',
    '5': 'Lima',
    '6': 'Enam',
    '7': 'Tujuh',
    '8': 'Delapan',
    '9': 'Sembilan'
  };

  const spokenDigits = numPart
    .split('')
    .map(d => digitMap[d] || d)
    .join(' ');

  return `${letter}, ${spokenDigits}`;
}

/**
 * Play full voice announcement: Chime first, then spoken voice in Indonesian
 */
export async function announceTicket(
  ticketNumber: string,
  counterNumber: number,
  counterName: string,
  serviceName: string,
  options: {
    soundEnabled: boolean;
    volume: number;
    speechRate?: number;
    speechPitch?: number;
  }
): Promise<void> {
  if (!options.soundEnabled) return;

  // 1. Play Chime
  await playChime(options.volume);

  // 2. Text to speech
  if (!('speechSynthesis' in window)) return;

  return new Promise((resolve) => {
    try {
      window.speechSynthesis.cancel(); // cancel previous if any

      const spokenTicket = formatSpokenTicket(ticketNumber);
      const textToSpeak = `Nomor antrian, ${spokenTicket}. Silakan menuju ke Loket ${counterNumber}. ${serviceName}.`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = options.speechRate || 0.92;
      utterance.pitch = options.speechPitch || 1.0;
      utterance.volume = Math.max(0.1, Math.min(1.0, options.volume / 100));

      // Attempt to find Indonesian voice
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia'));

      if (idVoice) {
        utterance.voice = idVoice;
        utterance.lang = 'id-ID';
      } else {
        utterance.lang = 'id-ID';
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      // Fallback safety timeout in case onend never fires in some browsers
      setTimeout(() => resolve(), 8000);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS announcement failed:', e);
      resolve();
    }
  });
}
