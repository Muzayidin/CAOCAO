/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:4001/:path*',
      },
      {
        source: '/api/orders/:path*',
        destination: 'http://localhost:4002/:path*',
      },
      {
        source: '/api/inventory/:path*',
        destination: 'http://localhost:4003/:path*',
      },
      {
        source: '/api/shift/:path*',
        destination: 'http://localhost:4004/:path*',
      },
      {
        source: '/api/employee/:path*',
        destination: 'http://localhost:4005/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
