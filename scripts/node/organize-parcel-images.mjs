import { basename, join } from "path";
import { mkdir, readdir, rename } from "fs/promises";

const path = process.argv[2];
const badFiles = [];
const mkdirPromises = [];
let filesDetected = 0;
let filesMoved = 0;

try {
  const files = await readdir(path, {
    withFileTypes: true,
  });

  for (const file of files) {
    // Ignore directories and symbolic links.
    if (!file.isFile()) {
      continue;
    }
    filesDetected++;

    const fileName = file.name;
    // Extract block and parcel specifiers from file name.
    const match = fileName.match(/^(B[a-zA-Z0-9]+)_(P[a-zA-Z0-9]+)/);

    if (!match) {
      badFiles.push(fileName);
      continue;
    }

    const block = match[1];
    const parcel = match[2];
    const imgDir = join(path, `${block}_${parcel}`);

    // Attempt to create image subdirectory if it doesn't exist.
    try {
      await mkdir(imgDir, {
        mode: "775",
      });

      console.log(`Created directory: ${imgDir}`);
    } catch (e) {
      if (e.code !== "EEXIST") console.error(e);
    }

    // Attempt to move the file into the proper subdirectory.
    try {
      const oldPath = join(path, fileName);
      const newPath = join(imgDir, fileName);
      await rename(oldPath, newPath);

      console.log(`Moved ${oldPath} to ${newPath}`);
      filesMoved++;
    } catch (e) {
      console.log(`Error while organizing file: ${e}`);
    }
  }
} catch (e) {
  console.error(`Error while processing directory: ${e}`);
}

if (badFiles.length > 0) {
  console.log(
    "The following filenames could not be matched:\n",
    badFiles.join("\n")
  );
}

console.log(`Files detected: ${filesDetected}`);
console.log(`Files moved: ${filesMoved}`);
