import * as THREE from 'three';
import type { Config, Pose } from './config';

/**
 * Stav A — ako boli krabice naložené (Patrik, 3. 11. 2026):
 * 3 rady za sebou po dĺžke vozíka, každý rad v priereze pyramída 2 + 2 + 1.
 *
 * Súradnice vozíka: počiatok v strede plošiny na zemi, +x vpravo, −z dopredu
 * (k bicyklu), +z dozadu (ku kamere).
 */

/** 0 = zadný rad (pri kamere), 1 = stredný, 2 = predný (pri bicykli) */
export type Row = 0 | 1 | 2;
/** −1 vľavo, +1 vpravo, 0 na stred (len vrchná vrstva) */
export type Col = -1 | 0 | 1;
export type Layer = 0 | 1 | 2;

export interface Slot {
  id: number;
  row: Row;
  col: Col;
  layer: Layer;
}

/**
 * Čísla podľa anotácie `assets/boxes/pocet-krabic.png`.
 * Stredný rad sedí s fotkou. Rozdelenie spadnutých medzi zadný a predný rad
 * je hypotéza (13 a 14 ležia bližšie k bicyklu → predný rad).
 */
export const SLOTS: Slot[] = [
  // stredný rad — na fotke zostal celý
  { id: 2, row: 1, col: -1, layer: 0 },
  { id: 1, row: 1, col: 1, layer: 0 },
  { id: 4, row: 1, col: -1, layer: 1 },
  { id: 3, row: 1, col: 1, layer: 1 },
  { id: 5, row: 1, col: 0, layer: 2 },
  // zadný rad — spadol celý
  { id: 8, row: 0, col: -1, layer: 0 },
  { id: 6, row: 0, col: 1, layer: 0 },
  { id: 7, row: 0, col: -1, layer: 1 },
  { id: 11, row: 0, col: 1, layer: 1 },
  { id: 10, row: 0, col: 0, layer: 2 },
  // predný rad — zostala len 15
  { id: 15, row: 2, col: -1, layer: 0 },
  { id: 12, row: 2, col: 1, layer: 0 },
  { id: 14, row: 2, col: -1, layer: 1 },
  { id: 13, row: 2, col: 1, layer: 1 },
  { id: 9, row: 2, col: 0, layer: 2 },
];

export const IDS = SLOTS.map((s) => s.id).sort((a, b) => a - b);

/** Krabice, ktoré na fotke zostali na vozíku. */
export const STAYS = new Set([1, 2, 3, 4, 5, 15]);

export function slotOf(id: number): Slot {
  const s = SLOTS.find((x) => x.id === id);
  if (!s) throw new Error(`neznáma krabica ${id}`);
  return s;
}

/** Póza s three.js typmi (počas behu). */
export interface PoseT {
  p: THREE.Vector3;
  q: THREE.Quaternion;
}

const DEG = Math.PI / 180;
const Y = new THREE.Vector3(0, 1, 0);

function trailerQuat(cfg: Config): THREE.Quaternion {
  return new THREE.Quaternion().setFromAxisAngle(Y, cfg.trailer.yaw * DEG);
}

function trailerToWorld(local: THREE.Vector3, cfg: Config): THREE.Vector3 {
  return local.applyQuaternion(trailerQuat(cfg)).add(new THREE.Vector3(cfg.trailer.x, 0, cfg.trailer.z));
}

export function poseA(id: number, cfg: Config): PoseT {
  const s = slotOf(id);
  const { w, h, d } = cfg.box;
  const local = new THREE.Vector3((s.col * w) / 2, cfg.trailer.platform + s.layer * h + h / 2, (1 - s.row) * d);
  return { p: trailerToWorld(local, cfg), q: trailerQuat(cfg) };
}

/**
 * Hrubý odhad stavu B pre spadnuté krabice, v súradniciach vozíka.
 * rx / ry / rz sú stupne (poradie YXZ), rz = 90 → krabica leží na boku.
 * Bez `y` sa krabica položí na zem.
 */
interface Guess {
  x: number;
  z: number;
  y?: number;
  rx?: number;
  ry?: number;
  rz?: number;
}

/** Spätná projekcia čísel z anotácie na zem (pri predvolenej kamere), potom od oka. */
const GUESS: Record<number, Guess> = {
  7: { x: -1.14, z: 0.37, ry: 8, rz: 90 },
  6: { x: -0.78, z: 0.28, ry: -4, rz: 90 },
  11: { x: -0.92, z: -0.51, ry: -10, rx: 10 },
  8: { x: -1.35, z: -0.79, ry: 15, rz: -8 },
  10: { x: -0.68, z: -0.74, y: 0.33, ry: -20, rz: 35 },
  12: { x: -0.32, z: -0.88, ry: 10, rz: -20 },
  9: { x: -1.15, z: -1.22, ry: 30, rz: 15 },
  13: { x: -0.25, z: -1.3, ry: 25 },
  14: { x: -0.45, z: -2.0, ry: -15 },
};

export function poseGuess(id: number, cfg: Config): PoseT {
  const g = GUESS[id];
  if (!g) return poseA(id, cfg);
  const local = new THREE.Quaternion().setFromEuler(
    new THREE.Euler((g.rx ?? 0) * DEG, (g.ry ?? 0) * DEG, (g.rz ?? 0) * DEG, 'YXZ'),
  );
  const pose: PoseT = {
    p: trailerToWorld(new THREE.Vector3(g.x, g.y ?? 1, g.z), cfg),
    q: trailerQuat(cfg).multiply(local),
  };
  if (g.y === undefined) dropTo(pose, cfg, 0);
  return pose;
}

/** Stav B: uložená póza, inak odhad (spadnuté) alebo stav A (na vozíku). */
export function poseB(id: number, cfg: Config): PoseT {
  const saved = cfg.b[String(id)];
  if (saved) return fromPose(saved);
  return STAYS.has(id) ? poseA(id, cfg) : poseGuess(id, cfg);
}

/** O koľko je najnižší roh pod stredom krabice (záporné číslo). */
function lowestOffset(q: THREE.Quaternion, cfg: Config): number {
  const { w, h, d } = cfg.box;
  let minY = Infinity;
  const c = new THREE.Vector3();
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        c.set((sx * w) / 2, (sy * h) / 2, (sz * d) / 2).applyQuaternion(q);
        minY = Math.min(minY, c.y);
      }
  return minY;
}

/** Výška najnižšieho rohu krabice nad cestou. */
export function lowestY(pose: PoseT, cfg: Config): number {
  return pose.p.y + lowestOffset(pose.q, cfg);
}

/** Posunie krabicu zvislo tak, aby jej najnižší roh bol vo výške `level`. */
export function dropTo(pose: PoseT, cfg: Config, level: number): void {
  pose.p.y = level - lowestOffset(pose.q, cfg);
}

const round = (v: number) => Math.round(v * 1e4) / 1e4;

export function toPose(t: PoseT): Pose {
  return {
    p: [round(t.p.x), round(t.p.y), round(t.p.z)],
    q: [round(t.q.x), round(t.q.y), round(t.q.z), round(t.q.w)],
  };
}

export function fromPose(p: Pose): PoseT {
  return {
    p: new THREE.Vector3(...p.p),
    q: new THREE.Quaternion(...p.q).normalize(),
  };
}
