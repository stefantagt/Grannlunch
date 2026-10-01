import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const sourceDir = path.resolve("original/bjorkhaga");
const outputDir = path.resolve("public/bjorkhaga/web");
const files = [
  "IMG_1769.JPEG",
  "IMG_1770.JPEG",
  "IMG_1774.JPEG",
  "IMG_1775.JPEG",
  "IMG_1776.JPEG",
  "IMG_1777.JPEG",
  "IMG_1778.JPEG",
  "IMG_1789.JPEG",
];

await mkdir(outputDir, { recursive: true });

for (const file of files) {
  const outputName = file.replace(/\.jpeg$/i, ".jpg");
  await sharp(path.join(sourceDir, file))
    .rotate()
    .resize({
      width: 1400,
      height: 1400,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 76, mozjpeg: true })
    .toFile(path.join(outputDir, outputName));
  console.log(outputName);
}
