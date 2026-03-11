# QFC NFT Metadata Service

IPFS pinning and ERC-721 metadata generation for the QFC ecosystem.

## Quick Start

```bash
cp .env.example .env
npm install
npm run dev
```

Server runs on `http://localhost:3285`.

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | /upload | Upload image + metadata, pin to IPFS |
| POST | /upload/batch | Upload zip of images + metadata JSONs |
| POST | /generate/ai | Generate metadata from species templates |
| GET | /metadata/:cid | Retrieve metadata by CID |
| GET | /health | Health check |

## Mock Mode

Set `USE_MOCK_IPFS=true` (default) to use local file cache instead of Pinata. CIDs are generated locally and metadata is cached at `~/.qfc-nft-metadata/`.

## Docker

```bash
docker build -t qfc-nft-metadata .
docker run -p 3285:3285 qfc-nft-metadata
```
