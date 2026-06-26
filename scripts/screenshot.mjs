import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'screenshots');
const BASE_URL = 'http://localhost:5173';
const WAIT_MS = 3000; // time for Three.js/WebGL to settle

const ROUTES = [
  { name: 'home',    path: '/'        },
  { name: 'sandbox', path: '/sandbox' },
  { name: 'theory',  path: '/theory'  },
  { name: 'about',   path: '/about'   },
];

function startDevServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'dev', '--', '--port', '5173'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    });

    const onData = (data) => {
      const line = data.toString();
      if (line.includes('Local') && line.includes('5173')) {
        resolve(proc);
      }
    };

    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);

    setTimeout(() => reject(new Error('Dev server did not start in 30s')), 30_000);
  });
}

async function screenshot(page, route, outDir) {
  await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await new Promise(r => setTimeout(r, WAIT_MS));
  const file = path.join(outDir, `${route.name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`  saved: ${file}`);
}

async function main() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });

  console.log('Starting dev server...');
  const server = await startDevServer();
  console.log('Dev server ready.\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    for (const route of ROUTES) {
      console.log(`Screenshotting /${route.name}...`);
      await screenshot(page, route, OUT);
    }

    console.log(`\nDone. Screenshots saved to: ${OUT}`);
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
