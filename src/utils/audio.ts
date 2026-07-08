let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playChime(type: 'complete' | 'click' | 'switch') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'complete') {
      // Beautiful layered chime (A major chord style)
      // Play E5 (659.25 Hz) and A5 (880 Hz) first
      playTone(ctx, 659.25, 'sine', now, 0.8, 0.2);
      playTone(ctx, 880.00, 'sine', now, 0.8, 0.2);
      
      // Play C#6 (1109.73 Hz) and E6 (1318.51 Hz) after 150ms
      playTone(ctx, 1109.73, 'sine', now + 0.15, 0.8, 0.25);
      playTone(ctx, 1318.51, 'sine', now + 0.15, 0.8, 0.25);
    } else if (type === 'click') {
      // Soft organic click
      playTone(ctx, 1400, 'triangle', now, 0.05, 0.1);
    } else if (type === 'switch') {
      // Soft sliding frequency up
      playToneWithSlide(ctx, 440, 660, 'sine', now, 0.12, 0.15);
    }
  } catch (error) {
    console.warn('Audio context failed to initialize or play sound:', error);
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  // Soft envelope to avoid audio clipping / popping
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playToneWithSlide(
  ctx: AudioContext,
  startFreq: number,
  endFreq: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
}
