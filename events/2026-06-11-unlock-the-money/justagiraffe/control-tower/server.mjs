import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PORT = Number(process.env.PORT || 8000);
const NAVIGATOR_URL = process.env.NAVIGATOR_URL || "http://localhost:3000";
const NAVIGATOR_URLS = Array.from(new Set([
  NAVIGATOR_URL,
  "http://localhost:3000",
  "http://localhost:3001",
]));

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

async function proxyNavigatorSubmissions(res) {
  const errors = [];
  for (const baseUrl of NAVIGATOR_URLS) {
    try {
      const upstream = await fetch(`${baseUrl}/api/submissions`, { cache: "no-store" });
      if (!upstream.ok) {
        errors.push(`${baseUrl}: HTTP ${upstream.status}`);
        continue;
      }
      const submissions = await upstream.json();
      return sendJson(res, 200, {
        source: baseUrl,
        submissions: Array.isArray(submissions) ? submissions : [],
      });
    } catch (error) {
      errors.push(`${baseUrl}: ${error instanceof Error ? error.message : "unavailable"}`);
    }
  }

  return sendJson(res, 502, {
    error: `Navigator API unavailable (${errors.join("; ")})`,
    submissions: [],
  });
}

function safeStaticPath(urlPath) {
  const requested = urlPath === "/" ? "/index.html" : decodeURIComponent(urlPath);
  const normalized = normalize(requested).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  return join(__dirname, normalized);
}

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (url.pathname === "/api/navigator-submissions") {
    return proxyNavigatorSubmissions(res);
  }

  const filePath = safeStaticPath(url.pathname);
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) {
      res.writeHead(404);
      return res.end("Not found");
    }

    const type = MIME_TYPES[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(PORT, () => {
  console.log(`SFP Control Tower running at http://localhost:${PORT}`);
  console.log(`Navigator submissions proxy: ${NAVIGATOR_URL}/api/submissions`);
});
