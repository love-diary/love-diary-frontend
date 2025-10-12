# Love Diary - Frontend

The frontend application for Love Diary, an AI-powered romance game where players develop relationships with unique NFT characters.

## Overview

This is the web interface built with Next.js that allows players to:
- Connect their crypto wallet
- Claim LOVE tokens from the testnet faucet
- Mint unique character NFTs
- Interact with AI-powered character agents
- Send gifts using LOVE tokens
- View character profiles and memories

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **RainbowKit** - Wallet connection
- **wagmi** - React hooks for Ethereum
- **ethers.js v6** - Ethereum library
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or other Web3 wallet

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

### Environment Variables

Create a `.env.local` file:

```bash
# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=16c7e7bee508f859fe612014c91f253d

# Contract Addresses (Base Sepolia)
NEXT_PUBLIC_LOVE_TOKEN_ADDRESS=0xf614a36b715a1f00bc9450d113d4eefeb0dd6396
NEXT_PUBLIC_FAUCET_ADDRESS=0xF09177Bb77d64084457cE2D7D51A4A28Bce00B84

# Optional
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

Get your WalletConnect Project ID from: https://cloud.walletconnect.com

## Project Structure

```
love-diary-frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── faucet/            # Faucet page
│       └── page.tsx
├── components/            # React components
│   ├── WalletConnect.tsx # Wallet button
│   ├── FaucetClaim.tsx   # Faucet interface
│   └── Layout/           # Layout components
├── lib/                  # Utilities and configs
│   ├── contracts.ts      # Contract addresses & ABIs
│   ├── wagmi.ts         # Wagmi configuration
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── styles/             # Global styles
```

## Features

### Current (MVP)

- ✅ Wallet connection (MetaMask, WalletConnect, Coinbase Wallet)
- ✅ LOVE token faucet (10000 LOVE/hour)
- ✅ Balance display
- ✅ Transaction feedback
- ✅ Base Sepolia testnet support

### Planned

- ⏳ Character NFT minting
- ⏳ Character chat interface
- ⏳ Gift sending
- ⏳ Character profiles
- ⏳ Relationship stats
- ⏳ Transaction history

## Deployed Contracts (Base Sepolia)

- **LoveToken**: `0xf614a36b715a1f00bc9450d113d4eefeb0dd6396`
  - [View on Basescan](https://sepolia.basescan.org/address/0xf614a36b715a1f00bc9450d113d4eefeb0dd6396)

- **LoveTokenFaucet**: `0xF09177Bb77d64084457cE2D7D51A4A28Bce00B84`
  - [View on Basescan](https://sepolia.basescan.org/address/0xF09177Bb77d64084457cE2D7D51A4A28Bce00B84)

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment

This project is configured for deployment on Vercel:

1. Push to GitHub
2. Import repository in Vercel
3. Configure environment variables
4. Deploy

Or use Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Contributing

This project is being developed for ETH Global Hackathon. Contributions are currently limited to the Love Diary team.

## License

All Rights Reserved

Copyright (c) 2025 Love Diary Team

See LICENSE file for details.

## Links

- **Contracts Repository**: [love-diary-contracts](https://github.com/love-diary/love-diary-contracts)
- **Agents Repository**: [love-diary-agents](https://github.com/love-diary/love-diary-agents)
- **Documentation**: Coming soon
- **Demo**: Coming soon

## Support

For questions or collaboration inquiries, please reach out to the development team.
