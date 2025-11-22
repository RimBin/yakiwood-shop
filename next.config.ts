import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'www.figma.com', pathname: '/**' },
      { protocol: 'https', hostname: 'figma.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;
