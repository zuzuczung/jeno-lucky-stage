let context: AudioContext | null = null;
const active = new Set<OscillatorNode>();
export function stopAudio(): void {
  active.forEach((o) => {
    try {
      o.stop();
    } catch {
      /* already ended */
    }
  });
  active.clear();
  if (context) {
    void context.close();
    context = null;
  }
}
export function playSound(
  kind: "click" | "scan" | "count" | "reveal",
  enabled: boolean,
): void {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    void context.resume();
    const ctx = context;
    const notes =
      kind === "reveal"
        ? [523, 659, 784, 1047]
        : kind === "count"
          ? [440]
          : kind === "scan"
            ? [220]
            : [660];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator(),
        g = ctx.createGain(),
        at = ctx.currentTime + i * 0.1;
      o.type = kind === "scan" ? "triangle" : "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.055, at + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.22);
      o.connect(g);
      g.connect(ctx.destination);
      active.add(o);
      o.onended = () => {
        active.delete(o);
        o.disconnect();
        g.disconnect();
      };
      o.start(at);
      o.stop(at + 0.24);
    });
  } catch {
    /* visual experience remains available */
  }
}
