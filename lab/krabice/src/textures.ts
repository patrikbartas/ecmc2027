import * as THREE from 'three';

/**
 * Provizórne textúry, nech je vidno, ktorá strana je ktorá:
 * čelo s držiakom (±z), bok s dierkami (±x), vrch s číslom (±y).
 * Dierky sú zatiaľ len namaľované — geometria príde v ďalšej fáze.
 */

export type Face = 'handle' | 'side' | 'top';

const CARDBOARD = '#c4a06e';
const EDGE = '#8a6a40';
const HOLE = '#2b1d10';
const NUMBER = '#e3001b';

function hole(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function faceTexture(face: Face, id: number, showNumber = true): THREE.CanvasTexture {
  const W = 256;
  const H = 192;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = CARDBOARD;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = EDGE;
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  ctx.fillStyle = HOLE;
  if (face === 'handle') {
    // držiak — zaoblený obdĺžnik v hornej tretine
    ctx.beginPath();
    ctx.roundRect(W * 0.36, H * 0.22, W * 0.28, H * 0.11, H * 0.055);
    ctx.fill();
    // na čele sú len dve spodné dierky
    hole(ctx, W * 0.14, H * 0.82, 6);
    hole(ctx, W * 0.86, H * 0.82, 6);
  } else if (face === 'side') {
    // bok má v skutočnosti 4 diery — zatiaľ vynechané, aby nemiatli pri ladení
  } else {
    // šev medzi klapkami
    ctx.fillRect(W * 0.5 - 1.5, 6, 3, H - 12);
  }

  if (showNumber) {
    ctx.fillStyle = NUMBER;
    ctx.font = `bold ${face === 'side' ? 48 : 84}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(id), W / 2, face === 'handle' ? H * 0.62 : H / 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
