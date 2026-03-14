import "dotenv/config";
import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import { pinJSON, pinFile, cidToUrl } from "./ipfs";
import { getCachedMetadata } from "./cache";
import { generateMetadata, getValidSpecies } from "./generator";
import { ERC721Metadata, GenerateRequest } from "./types";

const app = express();
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "10485760", 10);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});
const PORT = process.env.PORT || 3280;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", species: getValidSpecies() });
});

// POST /upload — single image + metadata
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    let metadata: ERC721Metadata;
    try {
      metadata = JSON.parse(req.body.metadata);
    } catch {
      res.status(400).json({ error: "Invalid metadata JSON" });
      return;
    }

    const imageCid = await pinFile(req.file.buffer, req.file.originalname);
    metadata.image = cidToUrl(imageCid);

    const metadataCid = await pinJSON(metadata);

    res.json({
      cid: metadataCid,
      url: cidToUrl(metadataCid),
      metadata,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /upload/batch — zip with images + metadata JSONs
app.post("/upload/batch", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No zip file provided" });
      return;
    }

    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();

    const images: Map<string, Buffer> = new Map();
    const metadatas: Map<string, ERC721Metadata> = new Map();

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      const name = entry.entryName.split("/").pop() || entry.entryName;
      const baseName = name.replace(/\.[^.]+$/, "");

      if (name.endsWith(".json")) {
        metadatas.set(baseName, JSON.parse(entry.getData().toString("utf-8")));
      } else {
        images.set(baseName, entry.getData());
      }
    }

    const cids: string[] = [];

    for (const [baseName, metadata] of metadatas) {
      const imageBuffer = images.get(baseName);
      if (imageBuffer) {
        const imageCid = await pinFile(imageBuffer, `${baseName}.png`);
        metadata.image = cidToUrl(imageCid);
      }

      const metaCid = await pinJSON(metadata);
      cids.push(metaCid);
    }

    res.json({
      cids,
      baseURI: cids.length > 0 ? cidToUrl(cids[0]).replace(cids[0], "") : "",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /generate/ai — template-based metadata generation
app.post("/generate/ai", async (req, res) => {
  try {
    const { species, traits, name } = req.body as GenerateRequest;

    if (!species) {
      res.status(400).json({
        error: "species is required",
        validSpecies: getValidSpecies(),
      });
      return;
    }

    const metadata = generateMetadata(species, traits, name);
    const cid = await pinJSON(metadata);
    metadata.image = cidToUrl(cid);

    res.json({
      metadata,
      cid,
      url: cidToUrl(cid),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// GET /metadata/:cid — retrieve metadata
app.get("/metadata/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cached = getCachedMetadata(cid);

    if (cached) {
      res.json(cached);
      return;
    }

    res.status(404).json({ error: "Metadata not found" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const server = app.listen(PORT, () => {
  console.log(`QFC NFT Metadata Service running on port ${PORT}`);
  console.log(`Mock IPFS: ${process.env.USE_MOCK_IPFS !== "false"}`);
});

function gracefulShutdown(signal: string): void {
  console.log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
