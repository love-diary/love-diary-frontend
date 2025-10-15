import { MintCharacter } from "@/components/MintCharacter";
import Link from "next/link";

export default function MintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-block mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Love Diary
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">Mint Your Character NFT</p>
        </div>

        {/* Mint Component */}
        <MintCharacter />

        {/* How It Works */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl mb-4 text-center">1️⃣</div>
              <h3 className="font-bold mb-2 text-center">Choose Attributes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Select your character&apos;s name, gender, and sexual orientation
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl mb-4 text-center">2️⃣</div>
              <h3 className="font-bold mb-2 text-center">Random Traits</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Birth date, occupation, and personality are randomly generated on-chain
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-3xl mb-4 text-center">3️⃣</div>
              <h3 className="font-bold mb-2 text-center">Mint NFT</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Pay 100 LOVE tokens to mint your unique character NFT
              </p>
            </div>
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
