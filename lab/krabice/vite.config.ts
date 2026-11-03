import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const SCENE_FILE = fileURLToPath(new URL('./public/scene.json', import.meta.url));
const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

/**
 * V dev serveri: POST /api/scene zapíše scénu do public/scene.json,
 * GET /scene.json ju číta priamo z disku. Vite si zoznam súborov v public/ drží z watchera
 * a ten scene.json ignoruje (aby uloženie nereloadlo stránku) — bez tohto by ho nevidel.
 */
function saveScene(): Plugin {
  return {
    name: 'krabice-save-scene',
    configureServer(server) {
      server.middlewares.use('/scene.json', (req, res, next) => {
        if (req.method !== 'GET' || !existsSync(SCENE_FILE)) return next();
        res.setHeader('content-type', 'application/json');
        res.setHeader('cache-control', 'no-store');
        res.end(readFileSync(SCENE_FILE));
      });
      server.middlewares.use('/api/scene', (req, res, next) => {
        if (req.method !== 'POST') return next();
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
          try {
            JSON.parse(body);
            mkdirSync(dirname(SCENE_FILE), { recursive: true });
            writeFileSync(SCENE_FILE, body.endsWith('\n') ? body : body + '\n');
            res.statusCode = 204;
            res.end();
          } catch (err) {
            res.statusCode = 400;
            res.end(String(err));
          }
        });
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [saveScene()],
  server: {
    // pevný port — rozpracovaný stav v localStorage patrí k adrese aj s portom
    port: 5180,
    strictPort: true,
    // fotka je v assets/boxes v koreni repa
    fs: { allow: [REPO_ROOT] },
    // uloženie scény nemá reloadnúť stránku
    watch: { ignored: ['**/public/scene.json'] },
  },
});
