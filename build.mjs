import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const publicDir = path.join(root, "public");
const BASE_PATH = "/Zip-Extractor/";

const runtimeFiles = [
  "favicon.svg",
  "manifest.json",
  "opengraph.jpg",
  "robots.txt",
  "star-icon.jpg",
  "supabase-api.js",
  "sw.js",
  "star-follower-ui-fixes.js",
  "timewall-overlay-cleanup.js",
  "assets",
];

const replaceAssetPaths = (html) =>
  html
    .replaceAll('src="./assets/', `src="${BASE_PATH}assets/`)
    .replaceAll('href="./assets/', `href="${BASE_PATH}assets/`)
    .replaceAll('src="/assets/', `src="${BASE_PATH}assets/`)
    .replaceAll('href="/assets/', `href="${BASE_PATH}assets/`)
    .replaceAll('src="./supabase-api.js', `src="${BASE_PATH}supabase-api.js`)
    .replaceAll('src="/supabase-api.js', `src="${BASE_PATH}supabase-api.js`)
    .replaceAll('src="./timewall-overlay-cleanup.js', `src="${BASE_PATH}timewall-overlay-cleanup.js`)
    .replaceAll('src="./star-follower-ui-fixes.js', `src="${BASE_PATH}star-follower-ui-fixes.js`)
    .replaceAll('href="./star-icon.jpg', `href="${BASE_PATH}star-icon.jpg`)
    .replaceAll('src="./star-icon.jpg', `src="${BASE_PATH}star-icon.jpg`)
    .replaceAll('href="/star-icon.jpg', `href="${BASE_PATH}star-icon.jpg`)
    .replaceAll('href="./favicon.svg', `href="${BASE_PATH}favicon.svg`)
    .replaceAll('href="/favicon.svg', `href="${BASE_PATH}favicon.svg`)
    .replaceAll('href="./manifest.json', `href="${BASE_PATH}manifest.json`)
    .replaceAll('href="/manifest.json', `href="${BASE_PATH}manifest.json`);

const rewriteBundleAssetPaths = async (directory) => {
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".js")) continue;
    const filePath = path.join(directory, file);
    const source = await readFile(filePath, "utf8");
    const corrected = source
      .replaceAll('"/assets/', `"${BASE_PATH}assets/`)
      .replaceAll("'\\/assets/", `'${BASE_PATH}assets/`)
      .replaceAll(
        'base:"/".replace(/\\/$/,"")',
        `base:"${BASE_PATH.slice(0, -1)}"`,
      );
    await writeFile(filePath, corrected);
  }
};

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(path.join(root, "index.html"), path.join(dist, "index.html"));
for (const file of runtimeFiles) {
  await cp(path.join(root, file), path.join(dist, file), { recursive: true });
}

const indexPath = path.join(dist, "index.html");
const correctedIndex = replaceAssetPaths(
  await readFile(indexPath, "utf8"),
);

await writeFile(indexPath, correctedIndex);
await writeFile(path.join(dist, "404.html"), correctedIndex);
await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "404.html"), correctedIndex);
await rewriteBundleAssetPaths(path.join(dist, "assets"));

console.log(`Built GitHub Pages site in ${path.relative(root, dist)}/`);