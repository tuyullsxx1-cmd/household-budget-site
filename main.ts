// DompetKeluarga — entrypoint penyerahan.
// Menyalin app/ + screenshots/ ke output lalu menulis /output/dossier.json
// via buildDossier dari ./vendor/makefun-frontend.ts (salinan kit, tak diubah).
// Stdlib Node 22 saja. Deterministik: dua run menulis byte yang sama.
// PENTING: jangan pernah rm() direktori output itu sendiri — grader jalan
// sebagai user 65534 dan tidak bisa menghapus dir yang parent-nya milik
// harness (EACCES). mkdir + sapu ISI-nya saja.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function sapuIsi(dir: string): void {
  for (const entri of readdirSync(dir)) {
    rmSync(join(dir, entri), { recursive: true, force: true });
  }
}

function main(): void {
  mkdirSync(outDir, { recursive: true });
  sapuIsi(outDir);
  const appSrc = join(repoRoot, 'app');
  const shotsSrc = join(repoRoot, 'screenshots');
  if (!existsSync(appSrc)) throw new Error('main.ts: app/ tidak ditemukan di ' + repoRoot);
  // Gate lokal: screenshots/ harus berisi 3–4 gambar, kalau tidak dossier gagal di gate.
  if (existsSync(shotsSrc)) {
    const shots = readdirSync(shotsSrc).filter((f) => /\.(png|jpe?g)$/i.test(f));
    if (shots.length < 3 || shots.length > 4) {
      throw new Error('main.ts: screenshots/ berisi ' + shots.length + ' gambar, harus 3–4');
    }
  }
  cpSync(appSrc, join(outDir, 'app'), { recursive: true });
  if (existsSync(shotsSrc)) cpSync(shotsSrc, join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16 * 1024 * 1024,
    app_path_max_bytes: 1000
  });
  // Dossier gate: maksimal 1,5 MiB — gagal keras daripada menyerahkan dossier melar.
  if (dossier.byteLength > Math.floor(1.5 * 1024 * 1024)) {
    throw new Error('main.ts: dossier.json ' + dossier.byteLength + ' byte melebihi 1,5 MiB');
  }
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
