const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || 5000;
const ROOT = fs.existsSync(path.join(__dirname, "dist"))
  ? path.join(__dirname, "dist")
  : __dirname;
const BASE_PATH = "/Zip-Extractor";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function safePath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  const filePath = path.resolve(ROOT, relativePath);
  return filePath.startsWith(`${ROOT}${path.sep}`) ? filePath : null;
}

const server = http.createServer((request, response) => {
  const requestedPath = new URL(request.url || "/", "http://localhost").pathname;
  const requestPath = requestedPath.startsWith(BASE_PATH)
    ? requestedPath.slice(BASE_PATH.length) || "/"
    : requestedPath;
  const requestedFile = safePath(requestPath);
  const filePath =
    requestedFile && fs.existsSync(requestedFile) && fs.statSync(requestedFile).isFile()
      ? requestedFile
      : path.join(ROOT, "index.html");

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Unable to read the requested file.");
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    const headers = {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    };

    if (path.basename(filePath) === "index.html") {
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
      headers["Cache-Control"] = "public, max-age=31536000, immutable";
    }

    response.writeHead(200, headers);
    response.end(content);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Star Follower running on port ${PORT}`);
});