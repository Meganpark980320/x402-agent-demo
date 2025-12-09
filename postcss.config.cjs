module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // 👈 이 줄이 반드시 있어야 합니다.
    tailwindcss: {}, // Next.js가 자동으로 처리할 때를 대비해 남겨둠
    autoprefixer: {},
  },
};