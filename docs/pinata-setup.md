# Pinata IPFS Setup

The NFT metadata service uses [Pinata](https://www.pinata.cloud/) for IPFS pinning. When Pinata credentials are not configured, the service falls back to mock mode (generates fake CIDs, stores data in memory only).

## 1. Create a Pinata Account

1. Go to [https://app.pinata.cloud/register](https://app.pinata.cloud/register)
2. Sign up with email or GitHub
3. The **free plan** includes 500 uploads and 100MB storage — sufficient for testnet

## 2. Generate API Keys

1. Log in to [Pinata Dashboard](https://app.pinata.cloud/)
2. Go to **API Keys** (left sidebar → Developers → API Keys)
3. Click **+ New Key**
4. Settings:
   - **Admin**: toggle ON (or selectively enable `pinFileToIPFS` and `pinJSONToIPFS`)
   - **Key Name**: `qfc-nft-metadata`
5. Click **Create Key**
6. Copy the **API Key** and **API Secret** — the secret is shown only once

## 3. Configure Environment Variables

Add to your `.env` file:

```env
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_api_secret_here
PINATA_GATEWAY=https://gateway.pinata.cloud
```

### Custom Gateway (Optional)

Pinata offers a **Dedicated Gateway** on paid plans for faster IPFS retrieval:

1. Go to **Gateways** in the Pinata dashboard
2. Create a dedicated gateway (e.g., `qfc-nft.mypinata.cloud`)
3. Set `PINATA_GATEWAY=https://qfc-nft.mypinata.cloud`

The free plan uses the shared gateway `https://gateway.pinata.cloud`.

## 4. VPS Deployment

For the QFC testnet deployment, add the keys to the VPS-A `.env` file:

```
# File: qfc-testnet/4vps/vps-a-app/.env
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_api_secret_here
PINATA_GATEWAY=https://gateway.pinata.cloud
```

Then restart the metadata service:

```bash
docker compose up -d qfc-nft-metadata
```

## 5. Verify

Test the pinning with a curl request:

```bash
# Pin JSON metadata
curl -X POST https://nft-metadata.testnet.qfc.network/api/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test NFT",
    "description": "Testing Pinata integration",
    "image": "ipfs://QmTest"
  }'

# Response: { "cid": "Qm...", "url": "ipfs://Qm..." }
```

## Mock Mode

When `PINATA_API_KEY` or `PINATA_SECRET_KEY` is not set (or `USE_MOCK_IPFS=true`), the service runs in mock mode:

- Generates fake CIDs (`Qm` + random hex)
- Stores data in memory (lost on restart)
- Useful for development and testing without a Pinata account

No errors are thrown — the API behaves identically, just without real IPFS persistence.
