import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';
import { http } from 'viem';

// Fallback for build time - you MUST set this in .env.local for the app to work
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

if (projectId === 'YOUR_PROJECT_ID_HERE' && typeof window !== 'undefined') {
  console.warn('⚠️ WalletConnect Project ID not set. Please create .env.local file with NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

// Use RPC proxy to keep API keys server-side
// In browser: calls /api/rpc which forwards to Alchemy/Infura
// In server: calls the actual RPC endpoint directly
const getRpcUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: use proxy API route
    return `${window.location.origin}/api/rpc`;
  }
  // Server: use direct RPC URL
  return process.env.BASE_RPC_URL || 'https://mainnet.base.org';
};

export const config = getDefaultConfig({
  appName: 'Love Diary',
  projectId,
  chains: [base],
  transports: {
    [base.id]: http(getRpcUrl()),
  },
  ssr: true,
});
