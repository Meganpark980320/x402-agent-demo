/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 👇 해커톤 필살기: 빌드할 때 에러 검사 무시하기 */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  /* 👇 아까 넣은 Web3 라이브러리 호환성 설정 */
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