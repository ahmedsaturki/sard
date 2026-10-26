/** @type {import('next').NextConfig} */
import { withPayload } from '@payloadcms/next/withPayload';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  experimental: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    },
  },
};

export default withPayload(nextConfig);
