// beep curto pra avisar pedido novo — sem arquivo de áudio
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

export function playOrderAlertSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    void ctx.resume().then(() => {
      const now = ctx.currentTime;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      gain.connect(ctx.destination);

      // dois tons curtinhos — tipo campainha
      for (const [offset, freq] of [
        [0, 880],
        [0.12, 1175],
      ] as const) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + offset);
        osc.connect(gain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.18);
      }
    });
  } catch {
    // browser bloqueou áudio — ignora
  }
}
