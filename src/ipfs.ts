import { v4 as uuidv4 } from "uuid";
import { Readable } from "stream";
import { cacheMetadata, cacheFile } from "./cache";

const useMock =
  process.env.USE_MOCK_IPFS === "true" ||
  !process.env.PINATA_API_KEY ||
  !process.env.PINATA_SECRET_KEY;

let pinata: any = null;

if (!useMock) {
  const PinataSDK = require("@pinata/sdk");
  pinata = new PinataSDK(
    process.env.PINATA_API_KEY,
    process.env.PINATA_SECRET_KEY
  );
}

function mockCid(): string {
  return "Qm" + uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "").slice(0, 12);
}

export async function pinJSON(data: unknown): Promise<string> {
  if (useMock) {
    const cid = mockCid();
    cacheMetadata(cid, data);
    return cid;
  }

  const result = await pinata.pinJSONToIPFS(data);
  const cid: string = result.IpfsHash;
  cacheMetadata(cid, data);
  return cid;
}

export async function pinFile(
  buffer: Buffer,
  filename: string
): Promise<string> {
  if (useMock) {
    const cid = mockCid();
    cacheFile(cid, buffer);
    return cid;
  }

  const stream = Readable.from(buffer);
  (stream as any).path = filename;
  const result = await pinata.pinFileToIPFS(stream, {
    pinataMetadata: { name: filename },
  });
  const cid: string = result.IpfsHash;
  cacheFile(cid, buffer);
  return cid;
}

export function cidToUrl(cid: string): string {
  return `ipfs://${cid}`;
}

export function cidToGatewayUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
