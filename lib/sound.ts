let ctx: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

/** Short metallic clink. Quiet, no sample file. */
export function playClink() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1680, now);
  osc.frequency.exponentialRampToValueAtTime(420, now + 0.07);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.12);

  const noise = audio.createBuffer(1, Math.floor(audio.sampleRate * 0.03), audio.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = audio.createBufferSource();
  src.buffer = noise;
  const ng = audio.createGain();
  ng.gain.setValueAtTime(0.03, now);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
  src.connect(ng);
  ng.connect(audio.destination);
  src.start(now);
}

let hum: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode } | null = null;

/** Low conveyor motor. Level runs 0 to 1 with rail speed; 0 lets it fall silent. */
export function motorHum(level: number) {
  if (typeof window === "undefined") return;
  const audio = context();
  if (!audio) return;
  if (!hum) {
    if (level <= 0) return;
    if (audio.state === "suspended") void audio.resume();
    const osc = audio.createOscillator();
    const filter = audio.createBiquadFilter();
    const gain = audio.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = 48;
    filter.type = "lowpass";
    filter.frequency.value = 220;
    gain.gain.value = 0.0001;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    osc.start();
    hum = { osc, gain, filter };
  }
  const now = audio.currentTime;
  const clamped = Math.max(0, Math.min(1, level));
  hum.gain.gain.setTargetAtTime(0.0001 + clamped * 0.03, now, 0.06);
  hum.osc.frequency.setTargetAtTime(44 + clamped * 18, now, 0.08);
}
