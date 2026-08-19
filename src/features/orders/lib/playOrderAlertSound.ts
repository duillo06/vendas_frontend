// campainha de cozinha — alta, aguda, duas levadas (sem arquivo de áudio)
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  audioCtx ??= new AC();
  return audioCtx;
}

export async function unlockOrderAlertAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

function beep(
  ctx: AudioContext,
  dest: AudioNode,
  start: number,
  freq: number,
  duration = 0.16,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.34, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playOrderAlertSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    void ctx.resume().then(() => {
      const now = ctx.currentTime;
      const master = ctx.createGain();
      // um pouco de filtro pra não estourar fone, mas ainda chama atenção
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3200, now);
      master.gain.setValueAtTime(0.85, now);
      filter.connect(master);
      master.connect(ctx.destination);

      // duas sequências: ti-ti-ti … ti-ti-ti
      const notes = [1397, 1760, 2093] as const;
      const gap = 0.15;
      const roundGap = 0.55;

      for (let round = 0; round < 2; round += 1) {
        const roundStart = now + round * (notes.length * gap + roundGap);
        notes.forEach((freq, index) => {
          beep(ctx, filter, roundStart + index * gap, freq);
        });
      }
    });
  } catch {
    // browser bloqueou áudio — ignora
  }
}
