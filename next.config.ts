import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Self-contained server in .next/standalone, for the Docker image on the Lightsail server.
  output: 'standalone',
};

export default config;
