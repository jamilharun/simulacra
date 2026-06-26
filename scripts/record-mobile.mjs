import puppeteer from 'puppeteer';
import { spawn, execSync } from 'child_process';
import { mkdir, writeFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'recordings');
const FRAMES_DIR = path.join(OUT, '_frames_mobile');
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 390, height: 844 };
const FPS = 20;

// iPhone 15 Pro user agent — triggers mobile UA detection if any lib uses it
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

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

// one down→drag→up stroke across a slider element
async function stroke(page, el, fromPct, toPct, stepMs = 30) {
  const box = await el.boundingBox();
  if (!box) return;
  const y = box.y + box.height / 2;
  const x0 = box.x + box.width * fromPct;
  const x1 = box.x + box.width * toPct;
  await moveTo(page, x0, y, 300);
  await page.mouse.down();
  const steps = Math.max(Math.abs(Math.ceil((x1 - x0) / 3)), 10);
  for (let i = 0; i <= steps; i++) {
    const x = x0 + (x1 - x0) * (i / steps);
    await page.mouse.move(x, y);
    cursor = { x, y };
    await sleep(stepMs);
  }
  await page.mouse.up();
  await sleep(400);
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

  const frames = [];

  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.setUserAgent(MOBILE_UA);

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
    await sleep(3000);

    // gentle drift — narrow screen, keep within 390px
    await sweepPath(page, [
      [195, 420], [100, 300], [300, 250], [200, 500],
      [320, 400], [80, 600], [195, 450],
    ], 500);

    // HUD is bottom-right: w-64=256px, right-4=16px → x: 118–374, bottom-4=16px
    // hover over it then tweak all 3 sliders
    console.log('  tweaking HUD sliders...');
    await moveTo(page, 246, 750, 500);
    await sleep(400);

    const allSliders = await page.$$('input[type="range"]');

    if (allSliders[0]) {
      await stroke(page, allSliders[0], 0.25, 0.85);
      await stroke(page, allSliders[0], 0.85, 0.4);
    }
    if (allSliders[1]) {
      await stroke(page, allSliders[1], 0.3, 0.9);
      await stroke(page, allSliders[1], 0.9, 0.35);
    }
    if (allSliders[2]) {
      await stroke(page, allSliders[2], 0.1, 0.95);
      await stroke(page, allSliders[2], 0.95, 0.5);
    }

    // drift around screen after tweaking
    await sweepPath(page, [
      [195, 450], [60, 350], [330, 280], [195, 600],
      [280, 480], [110, 520],
    ], 450);

    // scroll down to fade hero text
    console.log('  scrolling...');
    await smoothScroll(page, 900, 3000);
    await sleep(700);
    await smoothScroll(page, -900, 2000);
    await sleep(600);

    // ── scene 2: sandbox ──────────────────────────────────────────────────
    console.log('Scene 2: Sandbox');
    await clickNav(page, '/sandbox');
    await sleep(1500);

    // on mobile the panel is hidden — drift over the physics scene first
    await sweepPath(page, [
      [195, 400], [320, 300], [260, 550], [150, 450],
      [340, 480], [195, 350],
    ], 500);
    await sleep(1000);

    // click "Configure Engine" toggle (bottom-center, md:hidden)
    console.log('  opening Configure Engine panel...');
    const toggleBtn = await page.$('button.md\\:hidden');
    if (toggleBtn) {
      const box = await toggleBtn.boundingBox();
      if (box) await moveTo(page, box.x + box.width / 2, box.y + box.height / 2, 400);
      await sleep(300);
      await toggleBtn.click();
      await sleep(600); // panel slides in
    }

    // tweak sliders inside the now-open full-screen panel
    console.log('  tweaking Sandbox sliders...');
    const sandboxSliders = await page.$$('input[type="range"]');
    for (let si = 0; si < Math.min(sandboxSliders.length, 3); si++) {
      await stroke(page, sandboxSliders[si], 0.2, 0.8);
      await stroke(page, sandboxSliders[si], 0.8, 0.35);
    }

    // close the panel
    if (toggleBtn) {
      await toggleBtn.click();
      await sleep(500);
    }

    // watch physics after closing
    await sweepPath(page, [
      [195, 350], [300, 500], [100, 450], [220, 300],
    ], 600);
    await sleep(1500);

    // ── scene 3: theory ───────────────────────────────────────────────────
    console.log('Scene 3: Theory');
    await clickNav(page, '/theory');
    await sleep(1000);

    await sweepPath(page, [
      [195, 350], [300, 250], [100, 400], [220, 500],
    ], 500);

    await smoothScroll(page, 500, 2000);
    await sleep(800);

    // click Execute Sorting Sequence
    console.log('  clicking Execute Sorting...');
    const sortBtn = await page.$('button');
    if (sortBtn) {
      const box = await sortBtn.boundingBox();
      if (box) await moveTo(page, box.x + box.width / 2, box.y + box.height / 2, 400);
      await sleep(300);
      await sortBtn.click();
      await sleep(4000);
      await sortBtn.click();
      await sleep(1000);
    }

    await smoothScroll(page, 300, 1500);
    await sleep(500);

    // ── scene 4: about ────────────────────────────────────────────────────
    console.log('Scene 4: About');
    await clickNav(page, '/about');
    await sleep(1000);

    await sweepPath(page, [
      [195, 350], [300, 300], [120, 450],
    ], 500);

    await smoothScroll(page, 400, 2000);
    await sleep(600);
    await smoothScroll(page, -400, 1500);
    await sleep(500);

    // ── scene 5: home → enter sandbox ────────────────────────────────────
    console.log('Scene 5: Home → Enter Sandbox');
    await clickNav(page, '/');
    await sleep(1500);

    await sweepPath(page, [
      [195, 420], [300, 300], [100, 350], [250, 480],
    ], 500);

    // "Enter Sandbox →" — absolute top-8 right-8 = approx x=330, y=52 at 390px wide
    const enterBtn = await page.$('a[href="/sandbox"].absolute');
    if (enterBtn) {
      const box = await enterBtn.boundingBox();
      if (box) await moveTo(page, box.x + box.width / 2, box.y + box.height / 2, 500);
      await sleep(500);
      await enterBtn.click();
      await sleep(2000);
    }

    // final drift on sandbox after entry
    await sweepPath(page, [
      [195, 400], [300, 300], [100, 500], [220, 420],
    ], 500);
    await sleep(1000);

    // ── stop screencast ────────────────────────────────────────────────────
    await client.send('Page.stopScreencast');
    console.log(`\nCaptured ${frames.length} frames. Writing to disk...`);

    for (let i = 0; i < frames.length; i++) {
      const fname = path.join(FRAMES_DIR, `frame_${String(i).padStart(6, '0')}.jpg`);
      await writeFile(fname, frames[i]);
    }

    const outFile = path.join(OUT, 'simulacra-demo-mobile.mp4');
    console.log('Stitching video with ffmpeg...');
    execSync(
      `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%06d.jpg" ` +
      `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ` +
      `-c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p "${outFile}"`,
      { stdio: 'inherit' }
    );

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
