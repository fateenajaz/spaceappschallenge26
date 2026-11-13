import {
  readFile,
  writeFile,
  stat,
  mkdtemp,
  rename,
  rm,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
const run = promisify(execFile);
const sources = [
  {
    id: "2023-07",
    year: 2023,
    month: 7,
    title: "Climate Spiral through July 2023",
    sourceUrl: "https://svs.gsfc.nasa.gov/5137/",
    assetUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005137/GISTEMP_Spiral_July_C_2160p60.01400_print.jpg",
    publicationDate: "2023-08-14",
    evidence:
      "The source describes the Celsius climate spiral as showing monthly anomalies through July 2023; the supplied still shows 2023 and the final arc at July.",
    image: "/nasa/monthly/2023-07.jpg",
  },
  {
    id: "2023-08",
    year: 2023,
    month: 8,
    title: "Climate Spiral through August 2023",
    sourceUrl: "https://svs.gsfc.nasa.gov/5161/",
    assetUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a005100/a005161/GISTEMP_Spiral_Aug2023_English_degC_2160p60.01400_print.jpg",
    publicationDate: "2023-09-14",
    evidence:
      "The source explicitly describes the August Celsius spiral through August 2023 and tags the item Earth Information Center. The still shows the year 2023 and the final arc at August.",
    image: "/nasa/monthly/2023-08.jpg",
  },
  {
    id: "2024-05",
    year: 2024,
    month: 5,
    title: "Monthly temperature record through May 2024",
    sourceUrl: "https://svs.gsfc.nasa.gov/5311/",
    assetUrl:
      "https://svs.gsfc.nasa.gov/vis/a000000/a005300/a005311/GISTEMP_Lines_Rotate_2024_degC.00875_print.jpg",
    publicationDate: "2024-07-17",
    evidence:
      "The source explicitly describes the Celsius graph through May 2024 and tags the item Earth Information Center. The still is the completed monthly line graph and labels the 1951–1980 reference period.",
    image: "/nasa/monthly/2024-05.jpg",
  },
];
const locked = JSON.parse(
  await readFile("src/data/eic-frames.json", "utf8"),
) as { frames: { id: string; sha256: string }[] };
const download = process.argv.includes("--download");
const temporary = download
  ? await mkdtemp("public/nasa/monthly/.verify-")
  : null;
const prepared = await Promise.allSettled(
  sources.map(async (source) => {
    const path = temporary
      ? join(temporary, source.id + ".jpg")
      : "public" + source.image;
    if (download)
      await run("curl", [
        "--fail",
        "--location",
        "--silent",
        "--show-error",
        "--max-time",
        "40",
        source.assetUrl,
        "--output",
        path,
      ]);
    const bytes = await readFile(path),
      sha256 = createHash("sha256").update(bytes).digest("hex");
    if (locked.frames.find((f) => f.id === source.id)?.sha256 !== sha256)
      throw new Error(
        `NASA asset ${source.id} differs from the inspected manifest. Repeat source/date/visual review before changing the recorded hash.`,
      );
    return {
      ...source,
      sha256,
      retrievedAt: (await stat(path)).mtime.toISOString(),
    };
  }),
);
try {
  const failed = prepared.find((r) => r.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
  if (temporary)
    for (const source of sources)
      await rename(
        join(temporary, source.id + ".jpg"),
        "public" + source.image,
      );
} finally {
  if (temporary) await rm(temporary, { recursive: true, force: true });
}
const manifest = {
  version: 1,
  referencePeriod: "1951–1980",
  units: "°C",
  verificationMethod:
    "Published, date-specific NASA stills inspected against source-page descriptions and image labels; no video frame-number-to-month formula.",
  reviewedOn: "2026-11-12",
  credit:
    "NASA's Scientific Visualization Studio. Visualizations: Mark SubbaRao; spiral concept: Ed Hawkins.",
  revisionNote:
    "Graphics retain their publication-time data revisions. Audio uses the matching monthly date in the pinned November 2026 GISTEMP CSV; minor historical numerical revisions are possible. No pixel-derived temperature is claimed.",
  frames: prepared.filter((r) => r.status === "fulfilled").map((r) => r.value),
};
const serialized = JSON.stringify(manifest, null, 2) + "\n";
await writeFile("src/data/eic-frames.json", serialized);
await writeFile("public/data/eic-frames.json", serialized);
console.log(
  "Bound " +
    manifest.frames.length +
    " inspected NASA stills to explicit monthly endpoints.",
);
