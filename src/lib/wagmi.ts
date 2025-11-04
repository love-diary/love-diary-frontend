import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base } from 'wagmi/chains';

// Fallback for build time - you MUST set this in .env.local for the app to work
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE';

if (projectId === 'YOUR_PROJECT_ID_HERE' && typeof window !== 'undefined') {
  console.warn('⚠️ WalletConnect Project ID not set. Please create .env.local file with NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID');
}

export const config = getDefaultConfig({
  appName: 'Love Diary',
  projectId,
  chains: [base],
  ssr: true,
});
