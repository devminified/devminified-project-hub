// Minimal CDP screenshot driver (no deps). Node 22 global WebSocket + fetch.
import "dotenv/config";
import { writeFileSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { SignJWT } from "jose";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const PORT = 9333;
const BASE = process.env.SHOT_BASE || "http://localhost:3311";
const OUT = process.argv[2] || "design-review/before";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 834, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];
const PAGES = [
  { name: "login", path: "/login", auth: false },
  { name: "projects", path: "/", auth: true },
  { name: "project", path: "__FIRST_PROJECT__", auth: true },
  { name: "users", path: "/users", auth: true },
  { name: "archive", path: "/archive", auth: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map(); this.sessions = new Map();
    ws.addEventListener("message", (e) => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) { const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    });
  }
  send(method, params = {}, sessionId) {
    const id = ++this.id;
    return new Promise((res, rej) => { this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); });
  }
}

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((r, j) => { ws.addEventListener("open", r, { once: true }); ws.addEventListener("error", j, { once: true }); });
  return new CDP(ws);
}

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  const admin = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const project = await prisma.project.findFirstOrThrow({ where: { archived: false }, orderBy: { name: "asc" } });
  await prisma.$disconnect();

  const token = await new SignJWT({ userId: admin.id, email: admin.email, role: admin.role, expiresAt: new Date(Date.now() + 6e8).toISOString() })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d")
    .sign(new TextEncoder().encode(process.env.SESSION_SECRET));

  mkdirSync(OUT, { recursive: true });
  const chrome = spawn(CHROME, [
    "--headless=new", `--remote-debugging-port=${PORT}`, "--user-data-dir=/tmp/dmph3-chrome",
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars",
    "--force-device-scale-factor=2", "about:blank",
  ], { stdio: "ignore" });

  let version;
  for (let i = 0; i < 60; i++) {
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(300); }
  }
  const browser = await connect(version.webSocketDebuggerUrl);
  const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
  const S = (m, p) => browser.send(m, p, sessionId);

  await S("Page.enable"); await S("Runtime.enable"); await S("Network.enable");
  await S("Network.setCookie", { name: "session", value: token, domain: "localhost", path: "/" });

  for (const theme of ["light", "dark"]) {
    for (const vp of VIEWPORTS) {
      await S("Emulation.setDeviceMetricsOverride", {
        width: vp.width, height: vp.height, deviceScaleFactor: 2, mobile: vp.name === "mobile",
      });
      for (const p of PAGES) {
        const path = p.path === "__FIRST_PROJECT__" ? `/projects/${project.slug}` : p.path;
        await S("Page.navigate", { url: BASE + path });
        await sleep(2600);
        await S("Runtime.evaluate", {
          expression: `(()=>{const r=document.documentElement;r.classList.toggle('dark',${theme === "dark"});r.style.colorScheme='${theme}';})()`,
        });
        await sleep(900);
        const { data } = await S("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
        const file = `${OUT}/${vp.name}-${theme}-${p.name}.png`;
        writeFileSync(file, Buffer.from(data, "base64"));
        console.log("✓", file);
      }
    }
  }
  chrome.kill();
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
