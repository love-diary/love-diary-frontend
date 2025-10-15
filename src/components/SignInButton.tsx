"use client";

import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";

export function SignInButton({ onSignIn }: { onSignIn: () => void }) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!address) return;

    setIsSigningIn(true);
    setError(null);

    try {
      // 1. Get nonce from backend
      const nonceRes = await fetch("/api/auth/nonce");
      const { nonce } = await nonceRes.json();

      // 2. Create SIWE message
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to Love Diary",
        uri: window.location.origin,
        version: "1",
        chainId: 84532, // Base Sepolia
        nonce,
        issuedAt: new Date().toISOString(),
      });

      const messageString = message.prepareMessage();

      // 3. Sign message with wallet
      const signature = await signMessageAsync({ message: messageString });

      // 4. Send to backend for verification
      const signInRes = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageString,
          signature,
          address,
        }),
      });

      if (!signInRes.ok) {
        const error = await signInRes.json();
        throw new Error(error.error || "Sign in failed");
      }

      const { token } = await signInRes.json();

      // 5. Store token in localStorage
      localStorage.setItem("authToken", token);

      // 6. Callback
      onSignIn();
    } catch (err: unknown) {
      console.error("Sign in error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in";
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-lg
                 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 transition-all"
      >
        {isSigningIn ? "Signing In..." : "Sign In with Wallet"}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
