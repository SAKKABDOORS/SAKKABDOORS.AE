/**
 * Custom Node entry point for hosts that expect an app.js/server.js style
 * startup file instead of running "next start" directly — this is the case
 * for cPanel's "Setup Node.js App" (Phusion Passenger).
 *
 * In cPanel's Node.js App screen, set:
 *   Application startup file:  server.js
 * Passenger sets process.env.PORT itself; this file just has to listen on it.
 *
 * For any other host that lets you run npm scripts directly (a VPS, Docker,
 * Vercel, etc.) you can ignore this file and just use `npm run build && npm start`.
 */
const { createServer } = require("node:http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`Sakkab Doors ready on port ${port} (${dev ? "development" : "production"})`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Sakkab Doors server:", err);
    process.exit(1);
  });
