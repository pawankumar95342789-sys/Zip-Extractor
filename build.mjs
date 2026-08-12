import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

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

const replaceAbsoluteAssetPaths = (html) =>
  html
    .replaceAll('src="/assets/', 'src="./assets/')
    .replaceAll('href="/assets/', 'href="./assets/')
    .replaceAll('src="/supabase-api.js', 'src="./supabase-api.js')
    .replaceAll('href="/star-icon.jpg', 'href="./star-icon.jpg')
    .replaceAll('href="/favicon.svg', 'href="./favicon.svg')
    .replaceAll('href="/manifest.json', 'href="./manifest.json');

const rewriteBundleAssetPaths = async (directory) => {
  for (const file of await readdir(directory)) {
    if (!file.endsWith(".js")) continue;
    const filePath = path.join(directory, file);
    const source = await readFile(filePath, "utf8");
    const corrected = source
      .replaceAll('"/assets/', '"./assets/')
      .replaceAll("'\\/assets/", "'./assets/");
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
const correctedIndex = replaceAbsoluteAssetPaths(
  await readFile(indexPath, "utf8"),
);

await writeFile(indexPath, correctedIndex);
await writeFile(path.join(dist, "404.html"), correctedIndex);
await rewriteBundleAssetPaths(path.join(dist, "assets"));

console.log(`Built GitHub Pages site in ${path.relative(root, dist)}/`);