import type { NextConfig } from 'next';
const apiInternalUrl = process.env.API_INTERNAL_URL || 'http://api:3001';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiInternalUrl}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;
