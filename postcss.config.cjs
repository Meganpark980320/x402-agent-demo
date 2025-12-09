module.exports = {
  plugins: {
    // 👇 여기에 추가합니다!
    '@tailwindcss/postcss': {}, // Tailwind CSS PostCSS 플러그인
    tailwindcss: {}, // 기존 설정 유지 (혹시 모를 호환성 위해)
    autoprefixer: {},
  },
};