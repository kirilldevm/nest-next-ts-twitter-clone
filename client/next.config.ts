import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const base =
        process.env.NEXT_PUBLIC_API_URL ||
        'http://127.0.0.1:5001/fir-twitter-clone-ec0b2/us-central1/api';
      const apiUrl = base.startsWith('http') ? base : `http://${base}`;
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl.replace(/\/$/, '')}/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
