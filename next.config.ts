import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 1. 브라우저에서 안 쓰이는 Node.js 모듈 무시 설정
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

    // 2. pino 관련 에러 무시 (Web3 라이브러리 고질병 해결)
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    return config;
  },
};

export default nextConfig;