function djb2Hash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return (hash >>> 0).toString(36);
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(50, 1, 100, 30);
    ctx.fillStyle = '#069';
    ctx.fillText('EmbroideryMP', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('EmbroideryMP', 4, 17);
    return canvas.toDataURL().slice(-50);
  } catch {
    return 'canvas-blocked';
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return 'no-webgl';
    const ext = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!ext) return 'no-ext';
    const renderer = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL);
    return renderer || 'unknown';
  } catch {
    return 'webgl-blocked';
  }
}

function getAudioFingerprint(): string {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return 'no-audio';
    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;
    analyser.fftSize = 256;
    oscillator.connect(analyser);
    analyser.connect(ctx.destination);
    const arr = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(arr);
    ctx.close();
    return Array.from(arr.slice(0, 10)).join(',');
  } catch {
    return 'audio-blocked';
  }
}

function generateFingerprint(): string {
  const nav = window.navigator;
  const screen = window.screen;

  const parts: string[] = [
    nav.userAgent || '',
    nav.language || '',
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    `${nav.hardwareConcurrency || 0}`,
    `${(nav as any).deviceMemory || 0}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    nav.platform || '',
    getCanvasFingerprint(),
    getWebGLRenderer(),
    getAudioFingerprint(),
  ];

  return djb2Hash(parts.join('|||'));
}

const STORAGE_KEY = 'em_device_id';

export function getDeviceId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
  } catch {}

  const newId = generateFingerprint();
  try {
    localStorage.setItem(STORAGE_KEY, newId);
  } catch {}
  return newId;
}
