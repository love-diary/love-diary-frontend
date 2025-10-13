import { FaucetClaim } from "@/components/FaucetClaim";
import { CharacterList } from "@/components/CharacterList";
import { GettingStarted } from "@/components/GettingStarted";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Love Diary
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            AI-Powered Romance Game
          </p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Claim your LOVE tokens to start your journey
          </p>
        </div>

        {/* Getting Started Instructions */}
        <GettingStarted />

        {/* Faucet Component */}
        <FaucetClaim />

        {/* Character List */}
        <div className="mt-12 max-w-2xl mx-auto">
          <CharacterList />
        </div>

        {/* Info Section */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <div className="text-3xl mb-2">💖</div>
              <h3 className="font-bold mb-2">Get LOVE Tokens</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Claim 10,000 LOVE tokens every hour from the faucet
              </p>
            </div>
            <Link href="/mint" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-2">🎭</div>
                <h3 className="font-bold mb-2">Mint Characters</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create unique AI-powered NFT characters
                </p>
                <p className="text-sm text-pink-500 font-semibold mt-2">Mint Now →</p>
              </div>
            </Link>
            <a href="/love-diary-whitepaper.pdf" target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition cursor-pointer">
                <div className="text-3xl mb-2">📄</div>
                <h3 className="font-bold mb-2">Whitepaper</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn about Love Diary's innovations
                </p>
                <p className="text-sm text-pink-500 font-semibold mt-2">Read Now →</p>
              </div>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        <p>Built for ETH Global Hackathon</p>
        <p className="mt-2">Base Sepolia Testnet</p>
      </footer>
    </div>
  );
}
