import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import GUI from 'lil-gui';
// originál 4160 × 3120 — rovnaký záber ako zmenšená verzia 1600 × 1200, len ostrejší
import fotoUrl from '../../../assets/boxes/IMG_20191118_081300.jpg';
import { DEFAULTS, defaults, normalize, type Config, type Flaps } from './config';
import { IDS, STAYS, dropTo, lowestY, toPose } from './layout';
import { buildTracks, sample, type Track } from './anim';
import { faceTexture } from './textures';

const STORAGE_KEY = 'ecmc-krabice-v1';
const DEG = Math.PI / 180;
const EDGE_COLOR = 0xff3355;
const SELECTED_COLOR = 0xffe000;

const stage = document.getElementById('stage')!;
const foto = document.getElementById('foto') as HTMLImageElement;
const hud = document.getElementById('hud')!;
foto.src = fotoUrl;

// ── stav ────────────────────────────────────────────────────────────────

const cfg: Config = defaults();

const view = {
  photo: true,
  photoOpacity: 1,
  opacity: 0.55,
  edges: true,
  grid: true,
  trailer: true,
  free: false,
  horizon: true,
  numbers: true,
  flaps: true,
};

const anim = { t: 0, playing: false, speed: 1 };
let tracks = new Map<number, Track>();
let total = 1;
let selected: number | null = null;
let dragging = false;
/** gizmo je na kamere fotky (len vo voľnom pohľade) */
let editingCamera = false;

// ── three.js ────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 2.2));
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(-2, 5, 3);
scene.add(sun);

const photoCam = new THREE.PerspectiveCamera(53, 4 / 3, 0.05, 200);
const freeCam = new THREE.PerspectiveCamera(50, 4 / 3, 0.05, 200);
// poloha voľnej kamery sa nastaví v init()
const orbit = new OrbitControls(freeCam, renderer.domElement);
orbit.enabled = false;
const camHelper = new THREE.CameraHelper(photoCam);
camHelper.visible = false;
scene.add(camHelper);
// kamera musí byť v scéne, aby sa na ňu dalo pripnúť gizmo
scene.add(photoCam);

/**
 * Horizont = výška oka. Kružnica vo výške kamery ďaleko okolo nej sa premietne presne
 * na čiaru, kde sa zbiehajú vodorovné čiary sveta (rímsy fasády, čiary cesty).
 */
const HORIZON_R = 150;
const horizon = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 360 }, (_, i) => {
      const a = (i / 360) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * HORIZON_R, 0, Math.sin(a) * HORIZON_R);
    }),
  ),
  new THREE.LineBasicMaterial({ color: 0xffe000, depthTest: false }),
);
horizon.renderOrder = 10;
scene.add(horizon);

const activeCam = () => (view.free ? freeCam : photoCam);

const grid = new THREE.GridHelper(20, 40, 0x00e0ff, 0x00e0ff);
const gridMat = grid.material as THREE.LineBasicMaterial;
gridMat.transparent = true;
gridMat.opacity = 0.35;
// mriežka nesmie zasahovať za kameru (z > 0)
grid.position.z = -10.5;
scene.add(grid);

// ── vozík ───────────────────────────────────────────────────────────────

let trailer = new THREE.Group();
const trailerMats: THREE.MeshLambertMaterial[] = [];

function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) o.geometry.dispose();
  });
}

function buildTrailer() {
  scene.remove(trailer);
  disposeGroup(trailer);
  trailerMats.length = 0;
  trailer = new THREE.Group();
  const t = cfg.trailer;

  const deckMat = new THREE.MeshLambertMaterial({ color: 0x4a4a4a, transparent: true, opacity: view.opacity });
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x222222, transparent: true, opacity: view.opacity });
  trailerMats.push(deckMat, wheelMat);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(t.width, 0.025, t.length), deckMat);
  deck.position.y = t.platform - 0.0125;
  trailer.add(deck);

  const frame = new THREE.LineSegments(
    new THREE.EdgesGeometry(deck.geometry),
    new THREE.LineBasicMaterial({ color: 0xffd400 }),
  );
  frame.position.copy(deck.position);
  trailer.add(frame);

  for (const side of [-1, 1]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(t.wheel, 0.02, 8, 48), wheelMat);
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(side * (t.width / 2 + 0.06), t.wheel, t.axle);
    trailer.add(wheel);
  }

  trailer.position.set(t.x, 0, t.z);
  trailer.rotation.y = t.yaw * DEG;
  trailer.visible = view.trailer;
  scene.add(trailer);
}

// ── krabice ─────────────────────────────────────────────────────────────

interface BoxObj {
  id: number;
  mesh: THREE.Mesh;
  edges: THREE.LineSegments;
  mats: THREE.MeshLambertMaterial[];
  /** vnútro krabice — vidno ho, keď sú klapky otvorené */
  liner: THREE.Mesh;
  /** kĺby 4 klapiek v poradí Flaps: vľavo, vpravo, vpredu, vzadu */
  hinges: THREE.Group[];
}

const boxes = new Map<number, BoxObj>();

/** Hrúbka kartónu. */
const T = 0.004;
const CLOSED: Flaps = [0, 0, 0, 0];
const flapMat = new THREE.MeshLambertMaterial({
  color: 0xbd9a68,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: view.opacity,
});
const innerMat = new THREE.MeshLambertMaterial({ color: 0x7a5c38, side: THREE.BackSide, transparent: true, opacity: view.opacity });
const hiddenMat = new THREE.MeshBasicMaterial({ visible: false });
/** vnútro bez vrchu — poradie stien +x, −x, +y, −y, +z, −z */
const linerMats = [innerMat, innerMat, hiddenMat, innerMat, innerMat, innerMat];

/**
 * Klapky, zjednodušene: obdĺžniky na kĺbe hornej hrany.
 * Dlhé (vľavo / vpravo, kĺb pozdĺž z) siahajú do polovice šírky, takže spolu zavrú vrch.
 * Krátke (vpredu / vzadu, kĺb pozdĺž x) sú pod nimi, rovnako hlboké.
 * Uhol 0 = zavretá, 90 = kolmo hore, 180 = vyklopená naplocho von.
 */
const FLAPS = [
  { axis: 'z', side: -1 }, // vľavo
  { axis: 'z', side: 1 }, // vpravo
  { axis: 'x', side: 1 }, // vpredu (+z, čelo „PREDOK")
  { axis: 'x', side: -1 }, // vzadu
] as const;

function flapsOf(id: number): Flaps {
  return cfg.flaps[String(id)] ?? CLOSED;
}

function disposeChildren(g: THREE.Object3D) {
  for (const o of [...g.children]) {
    o.traverse((x) => {
      if (x instanceof THREE.Mesh || x instanceof THREE.LineSegments) x.geometry.dispose();
    });
    g.remove(o);
  }
}

/** (Pre)stavia klapky a vnútro podľa aktuálneho rozmeru krabice. */
function buildLid(b: BoxObj) {
  const { w, h, d } = cfg.box;
  const depth = w / 2;
  FLAPS.forEach((f, i) => {
    const hinge = b.hinges[i];
    disposeChildren(hinge);
    const long = f.axis === 'z';
    const geo = long ? new THREE.BoxGeometry(depth, T, d) : new THREE.BoxGeometry(w, T, depth);
    const flap = new THREE.Mesh(geo, flapMat);
    flap.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), b.edges.material as THREE.LineBasicMaterial));
    // dlhé ležia na krátkych
    const y = long ? 1.5 * T : 0.5 * T;
    if (long) {
      hinge.position.set((f.side * w) / 2, h / 2, 0);
      flap.position.set((-f.side * depth) / 2, y, 0);
    } else {
      hinge.position.set(0, h / 2, (f.side * d) / 2);
      flap.position.set(0, y, (-f.side * depth) / 2);
    }
    hinge.add(flap);
  });
  b.liner.geometry.dispose();
  b.liner.geometry = new THREE.BoxGeometry(w - 2 * T, h - T, d - 2 * T);
  b.liner.position.y = T / 2;
}

/** Natočí klapky; k = koľko z cesty A → B má krabica za sebou (v stave A sú zavreté). */
function setFlaps(b: BoxObj, angles: Flaps, k: number) {
  FLAPS.forEach((f, i) => {
    const a = angles[i] * k * DEG;
    if (f.axis === 'z') b.hinges[i].rotation.set(0, 0, -f.side * a);
    else b.hinges[i].rotation.set(f.side * a, 0, 0);
  });
}

/** Textúry stien v poradí BoxGeometry: +x, −x, +y, −y, +z, −z */
function faceMaps(id: number): THREE.CanvasTexture[] {
  const faces = ['side', 'side', 'top', 'top', 'handle', 'handle'] as const;
  return faces.map((f, i) => faceTexture(f, id, view.numbers, i === 4));
}

/** Prekreslí textúry všetkých krabíc (napr. po zapnutí / vypnutí čísel). */
function repaintBoxes() {
  for (const b of boxes.values()) {
    const maps = faceMaps(b.id);
    b.mats.forEach((m, i) => {
      m.map?.dispose();
      m.map = maps[i];
      m.needsUpdate = true;
    });
  }
}

function makeBoxes() {
  for (const id of IDS) {
    const mats = faceMaps(id).map((map) => new THREE.MeshLambertMaterial({ map, transparent: true, opacity: view.opacity }));
    const geo = new THREE.BoxGeometry(cfg.box.w, cfg.box.h, cfg.box.d);
    const mesh = new THREE.Mesh(geo, mats);
    mesh.userData.id = id;
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: EDGE_COLOR }));
    mesh.add(edges);
    const liner = new THREE.Mesh(new THREE.BufferGeometry(), linerMats);
    mesh.add(liner);
    const hinges = FLAPS.map(() => new THREE.Group());
    for (const hinge of hinges) mesh.add(hinge);
    scene.add(mesh);
    const b: BoxObj = { id, mesh, edges, mats, liner, hinges };
    buildLid(b);
    boxes.set(id, b);
  }
}

function resizeBoxes() {
  for (const b of boxes.values()) {
    b.mesh.geometry.dispose();
    b.edges.geometry.dispose();
    b.mesh.geometry = new THREE.BoxGeometry(cfg.box.w, cfg.box.h, cfg.box.d);
    b.edges.geometry = new THREE.EdgesGeometry(b.mesh.geometry);
    buildLid(b);
  }
}

function applyView() {
  foto.style.visibility = view.photo && !view.free ? 'visible' : 'hidden';
  foto.style.opacity = String(view.photoOpacity);
  for (const b of boxes.values()) {
    for (const m of b.mats) m.opacity = view.opacity;
    b.edges.visible = view.edges;
    // s klapkami je krabica hore otvorená: vrch skrytý, vnútro viditeľné
    b.mats[2].visible = !view.flaps;
    b.liner.visible = view.flaps;
    for (const hinge of b.hinges) hinge.visible = view.flaps;
  }
  flapMat.opacity = innerMat.opacity = view.opacity;
  for (const m of trailerMats) m.opacity = view.opacity;
  grid.visible = view.grid;
  trailer.visible = view.trailer;
  camHelper.visible = view.free;
  horizon.visible = view.horizon && !view.free;
  orbit.enabled = view.free && !dragging;
  tc.camera = activeCam();
  if (!view.free && editingCamera) select(null);
}

// ── kamera ──────────────────────────────────────────────────────────────

function applyCamera() {
  const c = cfg.camera;
  photoCam.fov = c.fov;
  photoCam.position.set(c.x, c.y, c.z);
  photoCam.rotation.set(c.pitch * DEG, c.yaw * DEG, c.roll * DEG, 'YXZ');
  photoCam.updateProjectionMatrix();
  photoCam.updateMatrixWorld();
  camHelper.update();
  horizon.position.set(c.x, c.y, c.z);
}

/** Gizmo pohlo kamerou → prepíš hodnoty v paneli. */
function cameraFromObject() {
  const c = cfg.camera;
  c.x = photoCam.position.x;
  c.y = photoCam.position.y;
  c.z = photoCam.position.z;
  const e = new THREE.Euler().setFromQuaternion(photoCam.quaternion, 'YXZ');
  c.pitch = e.x / DEG;
  c.yaw = e.y / DEG;
  c.roll = e.z / DEG;
  camHelper.update();
  horizon.position.set(c.x, c.y, c.z);
  persist();
  refresh(fCam);
}

/**
 * Jemné ladenie z klávesnice: šípky = natočenie / sklon, PgUp / PgDn = výška.
 * Krok 0,1° / 1 cm, so Shiftom 1° / 10 cm, s Alt 0,01° / 1 mm.
 */
function nudgeCamera(key: string, e: KeyboardEvent) {
  const scale = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
  const deg = 0.1 * scale;
  const m = 0.01 * scale;
  const c = cfg.camera;
  if (key === 'arrowleft') c.yaw += deg;
  else if (key === 'arrowright') c.yaw -= deg;
  else if (key === 'arrowup') c.pitch += deg;
  else if (key === 'arrowdown') c.pitch -= deg;
  else if (key === 'pageup') c.y += m;
  else if (key === 'pagedown') c.y -= m;
  onCam();
  refresh(fCam);
}

function toggleCameraGizmo() {
  if (editingCamera) return select(null);
  if (!view.free) return flash('Gizmo na kamere je vo voľnom pohľade (F). Tu: šípky a PgUp / PgDn.');
  select(null);
  editingCamera = true;
  tc.attach(photoCam);
  ui.box = 'kamera';
  updateHud();
}

// ── animácia ────────────────────────────────────────────────────────────

function rebuildTracks() {
  ({ tracks, total } = buildTracks(cfg));
  if (selected !== null || anim.t > total) anim.t = total;
  timeCtrl.max(total).updateDisplay();
}

function applyPoses() {
  for (const b of boxes.values()) {
    if (dragging && b.id === selected) continue;
    const tr = tracks.get(b.id);
    if (tr) setFlaps(b, flapsOf(b.id), sample(tr, anim.t, b.mesh.position, b.mesh.quaternion));
  }
}

function play() {
  select(null);
  if (anim.t >= total) anim.t = 0;
  anim.playing = true;
}

function showState(which: 'A' | 'B') {
  anim.playing = false;
  if (which === 'A') select(null);
  anim.t = which === 'A' ? 0 : total;
}

// ── ukladanie ───────────────────────────────────────────────────────────

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch {
    /* súkromné okno, zablokované úložisko — nevadí */
  }
}

/** Po každej zmene parametrov: ulož pracovnú kópiu a prepočítaj animáciu. */
function changed() {
  persist();
  rebuildTracks();
}

/** Nahradí obsah cfg bez výmeny objektov — panel ostane naviazaný. */
function setConfig(next: Config) {
  Object.assign(cfg.camera, next.camera);
  Object.assign(cfg.trailer, next.trailer);
  Object.assign(cfg.box, next.box);
  cfg.b = next.b;
  cfg.flaps = next.flaps;
  select(null);
  applyCamera();
  buildTrailer();
  resizeBoxes();
  applyView();
  changed();
  for (const c of gui.controllersRecursive()) c.updateDisplay();
}

async function fetchSceneFile(): Promise<Config | null> {
  try {
    const r = await fetch('scene.json', { cache: 'no-store' });
    if (!r.ok) return null;
    return normalize(await r.json());
  } catch {
    return null; // chýba, alebo dev server vrátil index.html
  }
}

function download(text: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  a.download = 'scene.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function saveToFile() {
  const body = JSON.stringify(cfg, null, 2);
  try {
    const r = await fetch('api/scene', { method: 'POST', body, headers: { 'content-type': 'application/json' } });
    if (r.status === 204) return flash('Uložené do public/scene.json');
  } catch {
    /* bez dev servera */
  }
  download(body);
  flash('Server neukladá — stiahnuté ako súbor');
}

function loadFromDisk() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      setConfig(normalize(JSON.parse(await file.text())));
      flash(`Načítané: ${file.name}`);
    } catch (err) {
      flash(`Chyba: ${String(err)}`);
    }
  };
  input.click();
}

// ── výber a úprava stavu B ──────────────────────────────────────────────

const tc = new TransformControls(photoCam, renderer.domElement);
tc.setSize(0.8);
scene.add(tc.getHelper());

tc.addEventListener('dragging-changed', (e) => {
  dragging = Boolean(e.value);
  orbit.enabled = view.free && !dragging;
  if (!dragging) commitSelected();
});
tc.addEventListener('objectChange', () => (editingCamera ? cameraFromObject() : commitSelected()));

function select(id: number | null) {
  selected = id;
  editingCamera = false;
  for (const b of boxes.values()) {
    (b.edges.material as THREE.LineBasicMaterial).color.set(b.id === id ? SELECTED_COLOR : EDGE_COLOR);
  }
  if (id === null) {
    tc.detach();
  } else {
    anim.playing = false;
    anim.t = total;
    applyPoses();
    tc.attach(boxes.get(id)!.mesh);
  }
  ui.box = id === null ? '—' : String(id);
  syncBoxEdit();
  updateHud();
}

function commitSelected() {
  if (selected === null) return;
  const m = boxes.get(selected)!.mesh;
  cfg.b[String(selected)] = toPose({ p: m.position.clone(), q: m.quaternion.clone() });
  changed();
  syncBoxEdit();
}

// ── presné hodnoty vybranej krabice ─────────────────────────────────────

/** Poloha (m) a natočenie (°, poradie YXZ: ry dookola, rx dopredu, rz do boku) vo svete. */
const boxEdit = { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, fl: 0, fr: 0, ff: 0, fb: 0 };

function syncBoxEdit() {
  const on = selected !== null;
  if (on) {
    const m = boxes.get(selected!)!.mesh;
    // zaokrúhlené, aby panel neukazoval 89.99999
    const r = (v: number, k: number) => Math.round(v * k) / k;
    boxEdit.x = r(m.position.x, 1e4);
    boxEdit.y = r(m.position.y, 1e4);
    boxEdit.z = r(m.position.z, 1e4);
    const e = new THREE.Euler().setFromQuaternion(m.quaternion, 'YXZ');
    boxEdit.rx = r(e.x / DEG, 100);
    boxEdit.ry = r(e.y / DEG, 100);
    boxEdit.rz = r(e.z / DEG, 100);
    [boxEdit.fl, boxEdit.fr, boxEdit.ff, boxEdit.fb] = flapsOf(selected!);
  }
  for (const c of fPrecise.controllers) {
    c.enable(on);
    c.updateDisplay();
  }
}

function onFlapEdit() {
  if (selected === null) return;
  cfg.flaps[String(selected)] = [boxEdit.fl, boxEdit.fr, boxEdit.ff, boxEdit.fb];
  persist();
}

function closeFlaps() {
  if (selected === null) return;
  delete cfg.flaps[String(selected)];
  persist();
  syncBoxEdit();
}

function onBoxEdit() {
  if (selected === null) return;
  const m = boxes.get(selected)!.mesh;
  m.position.set(boxEdit.x, boxEdit.y, boxEdit.z);
  m.quaternion.setFromEuler(new THREE.Euler(boxEdit.rx * DEG, boxEdit.ry * DEG, boxEdit.rz * DEG, 'YXZ'));
  commitSelected();
}

const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };

/**
 * Otočí krabicu o 90° a nechá ju ležať v rovnakej výške — najnižší roh ostane tam, kde bol.
 * Osi krabice: x naprieč (boky), y hore, z pozdĺž (čelá s držiakom).
 */
function rotateSelected(axis: keyof typeof AXES, local: boolean) {
  if (selected === null) return;
  const m = boxes.get(selected)!.mesh;
  const pose = { p: m.position.clone(), q: m.quaternion.clone() };
  const level = lowestY(pose, cfg);
  const r = new THREE.Quaternion().setFromAxisAngle(AXES[axis], Math.PI / 2);
  if (local) pose.q.multiply(r);
  else pose.q.premultiply(r);
  dropTo(pose, cfg, level);
  m.position.copy(pose.p);
  m.quaternion.copy(pose.q);
  commitSelected();
}

function dropSelected(level: 'ground' | 'platform') {
  if (selected === null) return;
  const m = boxes.get(selected)!.mesh;
  const pose = { p: m.position.clone(), q: m.quaternion.clone() };
  dropTo(pose, cfg, level === 'ground' ? 0 : cfg.trailer.platform);
  m.position.copy(pose.p);
  commitSelected();
}

function forgetSelected() {
  if (selected === null) return;
  delete cfg.b[String(selected)];
  changed();
  applyPoses();
  syncBoxEdit();
}

function cycle(dir: 1 | -1) {
  const i = selected === null ? (dir === 1 ? -1 : 0) : IDS.indexOf(selected);
  select(IDS[(i + dir + IDS.length) % IDS.length]);
}

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt: { x: number; y: number } | null = null;

renderer.domElement.addEventListener('pointerdown', (e) => {
  downAt = tc.axis ? null : { x: e.clientX, y: e.clientY };
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 4) return;
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, activeCam());
  // aj klik na klapku vyberie krabicu; čiary hrán sa nerátajú
  const hits = ray.intersectObjects([...boxes.values()].map((b) => b.mesh), true).filter((h) => h.object instanceof THREE.Mesh);
  let hit: THREE.Object3D | null = hits[0]?.object ?? null;
  while (hit && hit.userData.id === undefined) hit = hit.parent;
  select(hit ? (hit.userData.id as number) : null);
});

// ── panel ───────────────────────────────────────────────────────────────

const ui = {
  box: '—',
  play,
  stateA: () => showState('A'),
  stateB: () => showState('B'),
  translate: () => tc.setMode('translate'),
  rotate: () => tc.setMode('rotate'),
  ground: () => dropSelected('ground'),
  platform: () => dropSelected('platform'),
  forget: forgetSelected,
  closeFlaps: () => closeFlaps(),
  turnSide: () => rotateSelected('z', true),
  turnFront: () => rotateSelected('x', true),
  turnAround: () => rotateSelected('y', false),
  trailerToA: () => {
    for (const id of STAYS) delete cfg.b[String(id)];
    changed();
  },
  allToGuess: () => {
    if (!confirm('Zabudnúť všetky úpravy stavu B?')) return;
    cfg.b = {};
    cfg.flaps = {};
    select(null);
    changed();
  },
  save: saveToFile,
  download: () => download(JSON.stringify(cfg, null, 2)),
  load: loadFromDisk,
  reloadFile: async () => {
    const f = await fetchSceneFile();
    if (f) setConfig(f);
    flash(f ? 'Načítané zo scene.json' : 'scene.json zatiaľ neexistuje');
  },
  reset: () => {
    if (confirm('Vrátiť všetko na predvolené hodnoty?')) setConfig(defaults());
  },
  cameraGizmo: () => toggleCameraGizmo(),
  resetCamera: () => {
    Object.assign(cfg.camera, DEFAULTS.camera);
    onCam();
    refresh(fCam);
  },
  resetTrailer: () => {
    Object.assign(cfg.trailer, DEFAULTS.trailer);
    onTrailer();
    refresh(fTrailer);
  },
  resetBox: () => {
    Object.assign(cfg.box, DEFAULTS.box);
    onBox();
    refresh(fBox);
  },
};

const refresh = (folder: GUI) => {
  for (const c of folder.controllersRecursive()) c.updateDisplay();
};

// širší panel = dlhšie posuvníky = jemnejšie ladenie; stĺpec vedľa fotky (index.html)
const gui = new GUI({ title: 'Krabice — test', width: 380, container: document.getElementById('panel')! });

const fCam = gui.addFolder('Kamera');
const onCam = () => {
  applyCamera();
  persist();
};
fCam.add(cfg.camera, 'fov', 40, 60, 0.01).name('zorný uhol (°)').onChange(onCam);
fCam.add(cfg.camera, 'y', 1, 2.2, 0.001).name('výška (m)').onChange(onCam);
fCam.add(cfg.camera, 'pitch', -25, 0, 0.01).name('sklon (°)').onChange(onCam);
fCam.add(cfg.camera, 'yaw', -15, 15, 0.01).name('natočenie (°)').onChange(onCam);
fCam.add(cfg.camera, 'roll', -5, 5, 0.01).name('náklon (°)').onChange(onCam);
fCam.add(cfg.camera, 'x', -1, 1, 0.001).name('x (m)').onChange(onCam);
fCam.add(cfg.camera, 'z', -1, 1, 0.001).name('z (m)').onChange(onCam);
fCam.add(ui, 'cameraGizmo').name('gizmo na kameru (C)');
fCam.add(ui, 'resetCamera').name('↺ predvolená kamera');

const fTrailer = gui.addFolder('Vozík');
const onTrailer = () => {
  buildTrailer();
  changed();
};
fTrailer.add(cfg.trailer, 'x', -1, 3, 0.001).name('x (m)').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'z', -5, -1, 0.001).name('z (m)').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'yaw', -30, 30, 0.01).name('natočenie (°)').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'platform', 0.1, 0.6, 0.001).name('výška plošiny').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'length', 0.8, 2.2, 0.001).name('dĺžka').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'width', 0.4, 1.2, 0.001).name('šírka').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'axle', -0.8, 0.8, 0.001).name('os kolies').onChange(onTrailer);
fTrailer.add(cfg.trailer, 'wheel', 0.1, 0.4, 0.001).name('polomer kolesa').onChange(onTrailer);
fTrailer.add(ui, 'resetTrailer').name('↺ predvolený vozík');
fTrailer.close();

const fBox = gui.addFolder('Rozmer krabice');
const onBox = () => {
  resizeBoxes();
  changed();
};
fBox.add(cfg.box, 'w', 0.2, 0.6, 0.001).name('šírka (naprieč)').onChange(onBox);
fBox.add(cfg.box, 'h', 0.15, 0.5, 0.001).name('výška').onChange(onBox);
fBox.add(cfg.box, 'd', 0.2, 0.7, 0.001).name('dĺžka (pozdĺž)').onChange(onBox);
fBox.add(ui, 'resetBox').name('↺ predvolený rozmer');
fBox.close();

const fView = gui.addFolder('Zobrazenie');
fView.add(view, 'photo').name('fotka').onChange(applyView);
fView.add(view, 'photoOpacity', 0, 1, 0.01).name('fotka — krytie').onChange(applyView);
fView.add(view, 'opacity', 0, 1, 0.01).name('krabice — krytie').onChange(applyView);
fView.add(view, 'edges').name('hrany').onChange(applyView);
fView.add(view, 'grid').name('mriežka').onChange(applyView);
fView.add(view, 'trailer').name('vozík').onChange(applyView);
fView.add(view, 'free').name('voľný pohľad (F)').onChange(applyView).listen();
fView.add(view, 'horizon').name('horizont (výška oka)').onChange(applyView);
fView.add(view, 'numbers').name('čísla krabíc (N)').onChange(repaintBoxes).listen();
fView.add(view, 'flaps').name('klapky / uška (U)').onChange(applyView).listen();
fView.close();

const fAnim = gui.addFolder('Animácia');
fAnim.add(ui, 'play').name('▶ prehrať (medzerník)');
fAnim.add(ui, 'stateA').name('stav A');
fAnim.add(ui, 'stateB').name('stav B');
const timeCtrl = fAnim.add(anim, 't', 0, 1, 0.001).name('čas (s)').listen();
timeCtrl.onChange(() => {
  anim.playing = false;
});
fAnim.add(anim, 'speed', 0.05, 2, 0.05).name('rýchlosť');

const fEdit = gui.addFolder('Úprava stavu B');
fEdit.add(ui, 'box').name('vybraná krabica').disable().listen();
fEdit.add(ui, 'translate').name('posun (W)');
fEdit.add(ui, 'rotate').name('rotácia (E)');
fEdit.add(ui, 'ground').name('na zem (G)');
fEdit.add(ui, 'platform').name('na plošinu (P)');
fEdit.add(ui, 'turnSide').name('↻ 90° na bok (R)');
fEdit.add(ui, 'turnFront').name('↻ 90° na čelo (T)');
fEdit.add(ui, 'turnAround').name('↻ 90° dookola (Y)');
fEdit.add(ui, 'forget').name('zabudnúť úpravu (Backspace)');
fEdit.add(ui, 'trailerToA').name('krabice na vozíku = stav A');
fEdit.add(ui, 'allToGuess').name('všetko späť na odhad');

const fPrecise = fEdit.addFolder('vybraná krabica — presne');
fPrecise.add(boxEdit, 'ry', -180, 180, 0.1).name('natočenie dookola (°)').onChange(onBoxEdit);
fPrecise.add(boxEdit, 'rx', -180, 180, 0.1).name('náklon dopredu (°)').onChange(onBoxEdit);
fPrecise.add(boxEdit, 'rz', -180, 180, 0.1).name('náklon do boku (°)').onChange(onBoxEdit);
fPrecise.add(boxEdit, 'x', -2, 4, 0.001).name('x (m)').onChange(onBoxEdit);
fPrecise.add(boxEdit, 'y', -0.2, 1.5, 0.001).name('výška stredu (m)').onChange(onBoxEdit);
fPrecise.add(boxEdit, 'z', -6, 0, 0.001).name('z (m)').onChange(onBoxEdit);
fPrecise.add(boxEdit, 'fl', 0, 180, 0.5).name('klapka vľavo — dlhá (°)').onChange(onFlapEdit);
fPrecise.add(boxEdit, 'fr', 0, 180, 0.5).name('klapka vpravo — dlhá (°)').onChange(onFlapEdit);
fPrecise.add(boxEdit, 'ff', 0, 180, 0.5).name('klapka vpredu — krátka (°)').onChange(onFlapEdit);
fPrecise.add(boxEdit, 'fb', 0, 180, 0.5).name('klapka vzadu — krátka (°)').onChange(onFlapEdit);
fPrecise.add(ui, 'closeFlaps').name('zavrieť klapky');

const fFile = gui.addFolder('Súbor');
fFile.add(ui, 'save').name('uložiť do scene.json');
fFile.add(ui, 'download').name('stiahnuť JSON');
fFile.add(ui, 'load').name('načítať JSON…');
fFile.add(ui, 'reloadFile').name('načítať scene.json');
fFile.add(ui, 'reset').name('predvolené hodnoty');
fFile.close();

// ── klávesy a HUD ───────────────────────────────────────────────────────

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  const k = e.key.toLowerCase();
  if (k === ' ') {
    e.preventDefault();
    if (anim.playing) anim.playing = false;
    else play();
  } else if (k === 'a') showState('A');
  else if (k === 'b') showState('B');
  else if (k === 'w') tc.setMode('translate');
  else if (k === 'e') tc.setMode('rotate');
  else if (k === 'q') tc.setSpace(tc.space === 'local' ? 'world' : 'local');
  else if (k === 'g') dropSelected('ground');
  else if (k === 'r') rotateSelected('z', true);
  else if (k === 't') rotateSelected('x', true);
  else if (k === 'y') rotateSelected('y', false);
  else if (k === 'p') dropSelected('platform');
  else if (k === 'backspace') forgetSelected();
  else if (k === 'escape') select(null);
  else if (k === ']') cycle(1);
  else if (k === '[') cycle(-1);
  else if (k === 'f') {
    view.free = !view.free;
    applyView();
  } else if (k === 'c') toggleCameraGizmo();
  else if (k === 'u') {
    view.flaps = !view.flaps;
    applyView();
  } else if (k === 'n') {
    view.numbers = !view.numbers;
    repaintBoxes();
  }
  else if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', 'pageup', 'pagedown'].includes(k)) {
    e.preventDefault();
    nudgeCamera(k, e);
  } else return;
  updateHud();
});

let flashText = '';
let flashUntil = 0;

function flash(text: string) {
  flashText = text;
  flashUntil = performance.now() + 2500;
  updateHud();
}

function updateHud() {
  const mode = `${tc.mode === 'rotate' ? 'rotácia' : 'posun'} · ${tc.space === 'local' ? 'lokálne' : 'svet'} (Q)`;
  const sel = editingCamera
    ? `<b>kamera fotky</b> · ${mode}`
    : selected === null
      ? 'klikni na krabicu'
      : `<b>krabica ${selected}</b> · ${mode}`;
  const msg = performance.now() < flashUntil ? `\n<b>${flashText}</b>` : '';
  hud.innerHTML =
    `${sel}\n` +
    `W posun · E rotácia · R / T / Y otočiť o 90° · G na zem · P na plošinu · [ ] ďalšia · Esc zrušiť\n` +
    `kamera: ← → natočenie · ↑ ↓ sklon · PgUp / PgDn výška · Shift ×10 · Alt ÷10 · C gizmo (vo F)\n` +
    `medzerník prehrať · A / B stav · F voľný pohľad · N čísla · U klapky${msg}`;
}

// ── beh ─────────────────────────────────────────────────────────────────

function resize() {
  const { clientWidth: w, clientHeight: h } = stage;
  renderer.setSize(w, h, false);
  freeCam.aspect = photoCam.aspect = 4 / 3;
  freeCam.updateProjectionMatrix();
  photoCam.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);

let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (anim.playing) {
    anim.t += dt * anim.speed;
    if (anim.t >= total) {
      anim.t = total;
      anim.playing = false;
    }
  }
  if (flashUntil && now > flashUntil) {
    flashUntil = 0;
    updateHud();
  }
  if (view.free) orbit.update();
  applyPoses();
  renderer.render(scene, activeCam());
  requestAnimationFrame(frame);
}

async function init() {
  let loaded: Config | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) loaded = normalize(JSON.parse(s));
  } catch {
    /* nevadí */
  }
  loaded ??= await fetchSceneFile();

  makeBoxes();
  setConfig(loaded ?? defaults());
  // voľný pohľad zboku a zhora: v zábere je kamera fotky aj krabice
  const mid = new THREE.Vector3(cfg.camera.x, cfg.camera.y, cfg.camera.z)
    .add(new THREE.Vector3(cfg.trailer.x - 0.4, 0.3, cfg.trailer.z + 0.3))
    .multiplyScalar(0.5);
  orbit.target.copy(mid);
  freeCam.position.copy(mid).add(new THREE.Vector3(-3.2, 2.2, 2.2));
  resize();
  // stav B je to, čo je na fotke — tým sa začína ladenie
  anim.t = total;
  updateHud();
  requestAnimationFrame(frame);
}

init();
