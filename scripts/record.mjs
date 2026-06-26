import puppeteer from 'puppeteer';
import { spawn, execSync } from 'child_process';
import { mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'recordings');
const FRAMES_DIR = path.join(OUT, '_frames');
const PORT = process.env.PORT || 5173;
let BASE_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1440, height: 900 };
const FPS = 20;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── helpers ──────────────────────────────────────────────────────────────────

let cursor = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };

async function moveTo(page, x, y, duration = 280) {
  const fromX = cursor.x;
  const fromY = cursor.y;
  const steps = Math.max(Math.ceil(duration / 16), 2);
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mx = fromX + (x - fromX) * t;
    const my = fromY + (y - fromY) * t;
    await page.mouse.move(mx, my);
    cursor = { x: mx, y: my };
    await sleep(16);
  }
}

async function sweepPath(page, points, msPerSegment = 420) {
  for (let i = 0; i < points.length - 1; i++) {
    await moveTo(page, points[i + 1][0], points[i + 1][1], msPerSegment);
  }
}

async function dragSlider(page, selector, fromPct, toPct, duration = 1200) {
  const el = await page.$(selector);
  if (!el) return;
  const box = await el.boundingBox();
  if (!box) return;
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * fromPct;
  const endX = box.x + box.width * toPct;
  await moveTo(page, startX, y, 300);
  await page.mouse.down();
  const steps = Math.ceil(duration / 16);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    await page.mouse.move(startX + (endX - startX) * t, y);
    await sleep(16);
  }
  await page.mouse.up();
  await sleep(300);
}

async function smoothScroll(page, deltaY, duration = 2000) {
  const steps = Math.ceil(duration / 40);
  const chunk = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((dy) => window.scrollBy(0, dy), chunk);
    await sleep(40);
  }
}

async function clickNav(page, href) {
  await page.evaluate((h) => {
    const el = document.querySelector(`a[href="${h}"]`);
    if (el) el.click();
  }, href);
  await sleep(2500);
}

// ── dev server ────────────────────────────────────────────────────────────────

function isServerUp(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => { res.resume(); resolve(true); }).on('error', () => resolve(false));
  });
}

async function startDevServer() {
  // if a server is already running on the configured port, skip spawning
  if (await isServerUp(BASE_URL)) {
    console.log(`Using existing server at ${BASE_URL}`);
    return null;
  }

  const proc = spawn('npm', ['run', 'dev', '--', '--port', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore',
    env: { ...process.env },
  });
  proc.on('error', (err) => { throw err; });

  // poll until the server responds
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    await sleep(500);
    if (await isServerUp(BASE_URL)) return proc;
  }
  proc.kill();
  throw new Error('Dev server timeout');
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  if (!existsSync(OUT)) await mkdir(OUT, { recursive: true });
  if (existsSync(FRAMES_DIR)) await rm(FRAMES_DIR, { recursive: true });
  await mkdir(FRAMES_DIR);

  console.log('Starting dev server...');
  const server = await startDevServer();
  console.log('Dev server ready.\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let frameIndex = 0;
  const frames = [];

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);

    // ── start screencast ───────────────────────────────────────────────────
    const client = await page.createCDPSession();
    client.on('Page.screencastFrame', async ({ data, sessionId }) => {
      frames.push(Buffer.from(data, 'base64'));
      try { await client.send('Page.screencastFrameAck', { sessionId }); } catch {}
    });
    await client.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 85,
      maxWidth: VIEWPORT.width,
      maxHeight: VIEWPORT.height,
      everyNthFrame: 1,
    });

    // ── scene 1: home ──────────────────────────────────────────────────────
    console.log('Scene 1: Home');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await sleep(3000); // let WebGL settle

    // initial mouse sweep across screen
    await sweepPath(page, [
      [200, 450], [500, 300], [900, 500], [1200, 300], [1100, 600],
      [700, 700], [300, 550], [600, 400],
    ], 350);

    // hover HUD panel (bottom-right) and tweak sliders
    console.log('  tweaking HUD sliders...');
    await moveTo(page, 1250, 760, 350);
    await sleep(400);

    const allSliders = await page.$$('input[type="range"]');

    // helper: one down→drag→up stroke on a slider
    async function stroke(el, fromPct, toPct, stepMs = 12) {
      const box = await el.boundingBox();
      if (!box) return;
      const y = box.y + box.height / 2;
      const x0 = box.x + box.width * fromPct;
      const x1 = box.x + box.width * toPct;
      await moveTo(page, x0, y, 120);
      await page.mouse.down();
      const steps = Math.abs(Math.ceil((x1 - x0) / 4));
      for (let i = 0; i <= steps; i++) {
        const x = x0 + (x1 - x0) * (i / steps);
        await page.mouse.move(x, y);
        cursor = { x, y };
        await sleep(stepMs);
      }
      await page.mouse.up();
      await sleep(160);
    }

    if (allSliders[0]) await stroke(allSliders[0], 0.25, 0.85);
    if (allSliders[1]) await stroke(allSliders[1], 0.3, 0.9);
    if (allSliders[2]) await stroke(allSliders[2], 0.1, 0.95);

    // second mouse sweep after tweaking
    await sweepPath(page, [
      [600, 400], [300, 200], [800, 150], [1100, 400],
      [900, 600], [500, 700], [700, 450],
    ], 315);

    // scroll down to the very bottom
    console.log('  scrolling...');
    await smoothScroll(page, 5000, 2100);
    await sleep(800);

    // ── scene 2: sandbox ──────────────────────────────────────────────────
    console.log('Scene 2: Sandbox');
    await clickNav(page, '/sandbox');
    await sleep(1500); // let physics world load

    // mouse drift across the physics scene (right side, avoiding left panel)
    await sweepPath(page, [
      [900, 400], [1200, 250], [1100, 550], [850, 650],
      [1300, 400], [1000, 300], [1150, 600],
    ], 350);

    // tweak sandbox sliders (left panel is always visible on desktop)
    console.log('  tweaking Sandbox sliders...');
    const sandboxSliders = await page.$$('input[type="range"]');

    for (let si = 0; si < Math.min(sandboxSliders.length, 3); si++) {
      await stroke(sandboxSliders[si], 0.2, 0.8);
      await stroke(sandboxSliders[si], 0.8, 0.4);
    }

    // watch the physics for a moment
    await sweepPath(page, [
      [1000, 300], [1200, 500], [900, 600], [1100, 350],
    ], 420);
    await sleep(1500);

    // ── scene 3: theory ───────────────────────────────────────────────────
    console.log('Scene 3: Theory');
    await clickNav(page, '/theory');
    await sleep(1000);

    await sweepPath(page, [
      [400, 300], [800, 200], [1100, 400], [700, 500],
    ], 350);

    await smoothScroll(page, 600, 1400);
    await sleep(800);

    // click Execute Sorting Sequence button
    console.log('  clicking Execute Sorting...');
    const sortBtn = await page.$('button');
    if (sortBtn) {
      await sortBtn.hover();
      await sleep(400);
      await sortBtn.click();
      await sleep(4000); // watch the sort
      await sortBtn.click(); // reset
      await sleep(1000);
    }

    await smoothScroll(page, 400, 1050);
    await sleep(600);

    // ── scene 4: about ────────────────────────────────────────────────────
    console.log('Scene 4: About');
    await clickNav(page, '/about');
    await sleep(1000);

    await sweepPath(page, [
      [500, 350], [900, 300], [700, 500],
    ], 350);

    await smoothScroll(page, 500, 1400);
    await sleep(600);
    await smoothScroll(page, -500, 1050);
    await sleep(500);

    // ── stop screencast ────────────────────────────────────────────────────
    await client.send('Page.stopScreencast');
    console.log(`\nCaptured ${frames.length} frames. Writing to disk...`);

    // write frames
    for (let i = 0; i < frames.length; i++) {
      const fname = path.join(FRAMES_DIR, `frame_${String(i).padStart(6, '0')}.jpg`);
      await writeFile(fname, frames[i]);
    }

    // stitch with ffmpeg
    const outFile = path.join(OUT, 'simulacra-demo.mp4');
    console.log('Stitching video with ffmpeg...');
    execSync(
      `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%06d.jpg" ` +
      `-c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p "${outFile}"`,
      { stdio: 'inherit' }
    );

    // clean up frames
    await rm(FRAMES_DIR, { recursive: true });

    console.log(`\nDone! Video saved to: ${outFile}`);
  } finally {
    await browser.close();
    if (server) server.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
