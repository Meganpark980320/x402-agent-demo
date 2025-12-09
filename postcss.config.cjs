// postcss.config.cjs (Tailwind 플러그인 항목을 제거합니다!)
module.exports = {
  plugins: {
    // Tailwind는 Next.js가 자동으로 로드하도록 맡깁니다.
    // autoprefixer만 수동으로 로드합니다.
    autoprefixer: {},
  },
};