import puppeteer from 'puppeteer';
import { spawn, execSync } from 'child_process';
import { mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'recordings');
const FRAMES_DIR = path.join(OUT, '_frames');
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 1440, height: 900 };
const FPS = 20;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── helpers ──────────────────────────────────────────────────────────────────

let cursor = { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 };

async function moveTo(page, x, y, duration = 400) {
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

async function sweepPath(page, points, msPerSegment = 600) {
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
    await page.mouse.wheel({ deltaY: chunk });
    await sleep(40);
  }
}

async function clickNav(page, href) {
  await page.click(`nav a[href="${href}"]`);
  await sleep(2500);
}

// ── dev server ────────────────────────────────────────────────────────────────

function startDevServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['run', 'dev', '--', '--port', '5173'], {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    const onData = (data) => {
      if (data.toString().includes('5173')) resolve(proc);
    };
    proc.stdout.on('data', onData);
    proc.stderr.on('data', onData);
    proc.on('error', reject);
    setTimeout(() => reject(new Error('Dev server timeout')), 30_000);
  });
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
    ], 500);

    // hover HUD panel (bottom-right) and tweak sliders
    console.log('  tweaking HUD sliders...');
    await moveTo(page, 1250, 760, 500);
    await sleep(400);

    const allSliders = await page.$$('input[type="range"]');

    // helper: one down→drag→up stroke on a slider
    async function stroke(el, fromPct, toPct, stepMs = 30) {
      const box = await el.boundingBox();
      if (!box) return;
      const y = box.y + box.height / 2;
      const x0 = box.x + box.width * fromPct;
      const x1 = box.x + box.width * toPct;
      await moveTo(page, x0, y, 300);
      await page.mouse.down();
      const steps = Math.abs(Math.ceil((x1 - x0) / 4));
      for (let i = 0; i <= steps; i++) {
        const x = x0 + (x1 - x0) * (i / steps);
        await page.mouse.move(x, y);
        cursor = { x, y };
        await sleep(stepMs);
      }
      await page.mouse.up();
      await sleep(400);
    }

    // HUD: Gravity → right then back left
    if (allSliders[0]) {
      await stroke(allSliders[0], 0.25, 0.85);
      await stroke(allSliders[0], 0.85, 0.4);
    }
    // HUD: Time-Dilation → right then back
    if (allSliders[1]) {
      await stroke(allSliders[1], 0.3, 0.9);
      await stroke(allSliders[1], 0.9, 0.35);
    }
    // HUD: Chaos Coefficient → sweep right
    if (allSliders[2]) {
      await stroke(allSliders[2], 0.1, 0.95);
      await stroke(allSliders[2], 0.95, 0.5);
    }

    // second mouse sweep after tweaking
    await sweepPath(page, [
      [600, 400], [300, 200], [800, 150], [1100, 400],
      [900, 600], [500, 700], [700, 450],
    ], 450);

    // scroll down slowly
    console.log('  scrolling...');
    await smoothScroll(page, 1200, 3000);
    await sleep(800);
    await smoothScroll(page, -1200, 2000);
    await sleep(600);

    // ── scene 2: sandbox ──────────────────────────────────────────────────
    console.log('Scene 2: Sandbox');
    await clickNav(page, '/sandbox');
    await sleep(1500); // let physics world load

    // mouse drift across the physics scene (right side, avoiding left panel)
    await sweepPath(page, [
      [900, 400], [1200, 250], [1100, 550], [850, 650],
      [1300, 400], [1000, 300], [1150, 600],
    ], 500);

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
    ], 600);
    await sleep(1500);

    // ── scene 3: theory ───────────────────────────────────────────────────
    console.log('Scene 3: Theory');
    await clickNav(page, '/theory');
    await sleep(1000);

    await sweepPath(page, [
      [400, 300], [800, 200], [1100, 400], [700, 500],
    ], 500);

    await smoothScroll(page, 600, 2000);
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

    await smoothScroll(page, 400, 1500);
    await sleep(600);

    // ── scene 4: about ────────────────────────────────────────────────────
    console.log('Scene 4: About');
    await clickNav(page, '/about');
    await sleep(1000);

    await sweepPath(page, [
      [500, 350], [900, 300], [700, 500],
    ], 500);

    await smoothScroll(page, 500, 2000);
    await sleep(600);
    await smoothScroll(page, -500, 1500);
    await sleep(500);

    // ── scene 5: back to home, click Enter Sandbox ─────────────────────
    console.log('Scene 5: Home → Enter Sandbox');
    await clickNav(page, '/');
    await sleep(1500);

    await sweepPath(page, [
      [700, 400], [1000, 300], [1300, 200],
    ], 500);

    // hover then click "Enter Sandbox →" button (top-right corner)
    const enterBtn = await page.$('a[href="/sandbox"].absolute');
    if (enterBtn) {
      await enterBtn.hover();
      await sleep(600);
      await enterBtn.click();
      await sleep(2000);
    }

    // final mouse drift
    await sweepPath(page, [
      [900, 300], [1200, 500], [800, 600], [600, 350],
    ], 500);
    await sleep(1000);

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
    server.kill();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
