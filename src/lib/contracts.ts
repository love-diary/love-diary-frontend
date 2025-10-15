// Contract addresses on Base Sepolia
export const LOVE_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_LOVE_TOKEN_ADDRESS as `0x${string}`;
export const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS as `0x${string}`;
export const CHARACTER_NFT_ADDRESS = process.env.NEXT_PUBLIC_CHARACTER_NFT_ADDRESS as `0x${string}`;

// LoveToken ABI (ERC-20)
export const LOVE_TOKEN_ABI = [
  {
    "inputs": [],
    "name": "name",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// LoveTokenFaucet ABI
export const FAUCET_ABI = [
  {
    "inputs": [],
    "name": "CLAIM_AMOUNT",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "CLAIM_COOLDOWN",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "canClaim",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "getNextClaimTime",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "claimer", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "TokensClaimed",
    "type": "event"
  }
] as const;

// CharacterNFT ABI
export const CHARACTER_NFT_ABI = [
  {
    "inputs": [],
    "name": "MINT_COST",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "OCCUPATION_COUNT",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PERSONALITY_COUNT",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint8", "name": "gender", "type": "uint8" },
      { "internalType": "uint8", "name": "sexualOrientation", "type": "uint8" },
      { "internalType": "uint8", "name": "language", "type": "uint8" }
    ],
    "name": "mint",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getCharacter",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "uint32", "name": "birthTimestamp", "type": "uint32" },
          { "internalType": "uint8", "name": "gender", "type": "uint8" },
          { "internalType": "uint8", "name": "sexualOrientation", "type": "uint8" },
          { "internalType": "uint8", "name": "occupationId", "type": "uint8" },
          { "internalType": "uint8", "name": "personalityId", "type": "uint8" },
          { "internalType": "uint8", "name": "language", "type": "uint8" },
          { "internalType": "uint256", "name": "mintedAt", "type": "uint256" },
          { "internalType": "bool", "name": "isBonded", "type": "bool" },
          { "internalType": "bytes32", "name": "secret", "type": "bytes32" }
        ],
        "internalType": "struct CharacterNFT.Character",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "bond",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "isBonded",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
      { "indexed": false, "internalType": "uint8", "name": "gender", "type": "uint8" },
      { "indexed": false, "internalType": "uint8", "name": "sexualOrientation", "type": "uint8" }
    ],
    "name": "CharacterMinted",
    "type": "event"
  }
] as const;

// Enum mappings for CharacterNFT
export const Gender = {
  Male: 0,
  Female: 1,
  NonBinary: 2,
} as const;

export const SexualOrientation = {
  Straight: 0,
  SameGender: 1,
  Bisexual: 2,
  Pansexual: 3,
  Asexual: 4,
} as const;

export const Language = {
  EN: 0,
} as const;
