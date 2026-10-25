// Sard Lite Server - Run with: node server.mjs
// This starts the Payload 3 dev server for Live Preview

import { spawn } from "node:child_process";

console.log('[SERVER] Starting Payload 3 dev server...');

// Use Payload CLI to start dev server
const payload = spawn("npx", ["payload", "dev", "--config", "file:///D:/ahmed-research-lab/Bunya%20Labs/Sard/apps/lite/dist/payload.config.esm.js"], {
  cwd: process.cwd(),
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NODE_ENV: "development" }
});

payload.on("close", (code) => {
  console.log(`[SERVER] Payload dev server exited with code ${code}`);
});

payload.on("error", (err) => {
  console.error("[SERVER] Failed to start Payload dev server:", err);
});

// Keep the process running
process.on("SIGINT", () => {
  console.log("[SERVER] Shutting down...");
  process.exit(0);
});

console.log("[SERVER] Starting Payload 3 dev server...");
console.log("[SERVER] Admin will be available at http://localhost:4321/admin");
