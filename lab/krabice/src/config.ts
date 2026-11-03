/**
 * Všetko, čo sa ladí a ukladá do scene.json.
 *
 * Svet: three.js, os y hore, jednotky metre, cesta je rovina y = 0.
 * Kamera fotky stojí pri počiatku a pozerá zhruba do −z.
 * Uhly sú v stupňoch, aby sa dali čítať v JSON aj v paneli.
 */

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];

export interface Pose {
  p: Vec3;
  q: Quat;
}

export interface Config {
  version: 1;
  camera: {
    /** vertikálny zorný uhol */
    fov: number;
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
    roll: number;
  };
  trailer: {
    /** stred plošiny na zemi */
    x: number;
    z: number;
    yaw: number;
    /** výška hornej plochy plošiny nad cestou */
    platform: number;
    length: number;
    width: number;
    /** posun osi kolies od stredu plošiny, + smerom dozadu (ku kamere) */
    axle: number;
    wheel: number;
  };
  box: {
    /** naprieč vozíkom — čelo s držiakom */
    w: number;
    h: number;
    /** pozdĺž vozíka */
    d: number;
  };
  /** Pózy v stave B (svetové súradnice). Chýbajúca krabica = odhad / stav A. */
  b: Record<string, Pose>;
}

/**
 * Prvý odhad z fotky 1600 × 1200 (3. 11. 2026):
 *
 * - zorný uhol z údajov v Google Fotkách (súbor z nich má EXIF orezaný):
 *   Xiaomi Redmi 4X, 4,12 mm, 4160 × 3120, pixel 1,12 µm
 *   → f = 4,12 / 0,00112 = 3 679 px → 1 415 px pri 1600 px → fov = 2·atan(600 / 1415) = 46,0°
 * - sklon z horizontu: čiary fasády sa zbiehajú pri y ≈ 284 → atan(316 / 1415) = 12,6° dole
 * - mierka nie je známa: výška mobilu 1,55 m je predpoklad a rozmer krabice z neho vychádza
 *   (čelo ~1,3 : 1). Keď niekto krabicu zmeria, prepočíta sa výška kamery, nie naopak.
 */
export const DEFAULTS: Config = {
  version: 1,
  camera: { fov: 45.96, x: 0, y: 1.55, z: 0, yaw: 0, pitch: -12.59, roll: 0 },
  trailer: { x: 1.02, z: -2.97, yaw: 0, platform: 0.3, length: 1.3, width: 0.66, axle: 0, wheel: 0.22 },
  box: { w: 0.3, h: 0.23, d: 0.4 },
  b: {},
};

export function defaults(): Config {
  return structuredClone(DEFAULTS);
}

/** Zlúči načítané dáta s predvolenými, aby starší súbor nerozbil novší kód. */
export function normalize(raw: unknown): Config {
  const base = defaults();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<Config>;
  return {
    version: 1,
    camera: { ...base.camera, ...(r.camera ?? {}) },
    trailer: { ...base.trailer, ...(r.trailer ?? {}) },
    box: { ...base.box, ...(r.box ?? {}) },
    b: { ...(r.b ?? {}) },
  };
}
