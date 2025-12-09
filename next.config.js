/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 1. 빌드 에러 무시 (해커톤용 필살기)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2. Web3 라이브러리 호환성 설정 (Webpack)
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false 
    };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

module.exports = nextConfig;