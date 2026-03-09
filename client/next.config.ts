import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const base =
        process.env.NEXT_PUBLIC_API_BACKEND ||
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
