"use client";

import { useState } from "react";

export function GettingStarted() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-md mx-auto mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            🚀 Getting Started
          </h2>
          <svg
            className={`w-6 h-6 text-blue-900 dark:text-blue-100 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Click to {isExpanded ? "hide" : "view"} setup instructions
        </p>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 text-gray-700 dark:text-gray-300">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">
              Step 1: Connect to Base Mainnet
            </h3>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Open your wallet and click the network dropdown</li>
              <li>Select &quot;Base&quot; or add it manually:</li>
              <li>
                Network details:
                <div className="mt-2 ml-6 bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono">
                  <div>
                    <strong>Network Name:</strong> Base
                  </div>
                  <div>
                    <strong>RPC URL:</strong> https://mainnet.base.org
                  </div>
                  <div>
                    <strong>Chain ID:</strong> 8453
                  </div>
                  <div>
                    <strong>Currency Symbol:</strong> ETH
                  </div>
                  <div>
                    <strong>Block Explorer:</strong> https://basescan.org
                  </div>
                </div>
              </li>
              <li>Switch to Base network</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">
              Step 2: Get ETH on Base
            </h3>
            <p className="mb-2">
              You need ETH on Base to pay for gas fees:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Bridge ETH from Ethereum mainnet to Base using the official{" "}
                <a
                  href="https://bridge.base.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Base Bridge
                </a>
              </li>
              <li>Or buy ETH directly on Base via an exchange</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-800 dark:text-blue-200">
              Step 3: Get LOVE Tokens
            </h3>
            <p>Purchase LOVE tokens from Uniswap to mint and interact with characters!</p>
          </div>
        </div>
      )}
    </div>
  );
}
