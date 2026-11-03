import * as THREE from 'three';
import type { Config } from './config';
import { SLOTS, STAYS, poseA, poseB, type PoseT } from './layout';

/**
 * Animácia v1 — balistika + slerp (docs/ideas/05-krabice-3d.md, krok 7a).
 *
 * Každá spadnutá krabica letí po parabole, ktorá presne končí v stave B:
 *   p(τ) = p_A + v₀·τ + ½·g·τ²,   v₀ = (p_B − p_A − ½·g·T²) / T
 *   q(τ) = slerp(q_A, q_B, τ / T)
 * Čas letu T = √(2·(Δy + HOP) / g) — krabica najprv trochu nadskočí o HOP.
 * Krabice, ktoré ostali na vozíku, sa len plynulo posunú z A do B.
 */

const G = 9.81;
const HOP = 0.12;
const GRAVITY = new THREE.Vector3(0, -G, 0);

/** Kto padá skôr: zadný rad pred predným, vrch pred spodkom, ľavá strana prvá. */
const ROW_DELAY = { 0: 0, 1: 0, 2: 0.35 } as const;
const LAYER_DELAY = 0.1;
const COL_DELAY = { [-1]: 0, 0: 0.03, 1: 0.07 } as const;

const SLIDE_START = 0.15;
const SLIDE_DUR = 0.5;
const TAIL = 0.25;

export interface Track {
  id: number;
  a: PoseT;
  b: PoseT;
  kind: 'fall' | 'slide';
  start: number;
  dur: number;
  v0: THREE.Vector3;
}

export function buildTracks(cfg: Config): { tracks: Map<number, Track>; total: number } {
  const tracks = new Map<number, Track>();
  let total = 0;
  for (const s of SLOTS) {
    const a = poseA(s.id, cfg);
    const b = poseB(s.id, cfg);
    let track: Track;
    if (STAYS.has(s.id)) {
      track = { id: s.id, a, b, kind: 'slide', start: SLIDE_START, dur: SLIDE_DUR, v0: new THREE.Vector3() };
    } else {
      const dy = Math.max(a.p.y - b.p.y, 0);
      const dur = Math.sqrt((2 * (dy + HOP)) / G);
      const v0 = b.p.clone().sub(a.p).divideScalar(dur).addScaledVector(GRAVITY, -0.5 * dur);
      const start = ROW_DELAY[s.row] + (2 - s.layer) * LAYER_DELAY + COL_DELAY[s.col];
      track = { id: s.id, a, b, kind: 'fall', start, dur, v0 };
    }
    tracks.set(s.id, track);
    total = Math.max(total, track.start + track.dur);
  }
  return { tracks, total: total + TAIL };
}

const smooth = (u: number) => u * u * (3 - 2 * u);

/**
 * Póza krabice v čase t (sekundy od začiatku).
 * Vráti, koľko z cesty A → B má krabica za sebou (0 … 1) — podľa toho sa otvárajú klapky.
 */
export function sample(tr: Track, t: number, outP: THREE.Vector3, outQ: THREE.Quaternion): number {
  const tau = t - tr.start;
  if (tau <= 0) {
    outP.copy(tr.a.p);
    outQ.copy(tr.a.q);
    return 0;
  }
  if (tau >= tr.dur) {
    outP.copy(tr.b.p);
    outQ.copy(tr.b.q);
    return 1;
  }
  const u = tau / tr.dur;
  if (tr.kind === 'fall') {
    outP.copy(tr.a.p).addScaledVector(tr.v0, tau).addScaledVector(GRAVITY, 0.5 * tau * tau);
    outQ.slerpQuaternions(tr.a.q, tr.b.q, u);
    return u;
  }
  const k = smooth(u);
  outP.lerpVectors(tr.a.p, tr.b.p, k);
  outQ.slerpQuaternions(tr.a.q, tr.b.q, k);
  return k;
}
