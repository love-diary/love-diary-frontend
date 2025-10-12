import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Ignore optional dependencies that cause warnings
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      '@react-native-async-storage/async-storage': false,
    };

    // Ignore missing optional dependencies warnings
    config.ignoreWarnings = [
      { module: /node_modules\/pino\/lib\/tools\.js/ },
      { module: /node_modules\/@metamask\/sdk\/dist\/browser\/es\/metamask-sdk\.js/ },
    ];

    return config;
  },
};

export default nextConfig;
