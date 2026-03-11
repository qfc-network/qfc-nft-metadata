export interface ERC721Attribute {
  trait_type: string;
  value: string | number;
}

export interface ERC721Metadata {
  name: string;
  description: string;
  image: string;
  attributes: ERC721Attribute[];
}

export interface UploadResult {
  cid: string;
  url: string;
  metadata: ERC721Metadata;
}

export interface BatchUploadResult {
  cids: string[];
  baseURI: string;
}

export interface GenerateRequest {
  species: string;
  traits?: string[];
  name?: string;
}
