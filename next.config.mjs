/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 👇 1. 빌드 에러 무시 (기존 유지) */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* 👇 2. [추가됨] 메모리 절약을 위해 소스맵 끄기 */
  productionBrowserSourceMaps: false,

  /* 👇 3. Web3 호환성 설정 (기존 유지) */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'pino-pretty': false,
        'lokijs': false,
        'encoding': false,
        'child_process': false,
      };
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;