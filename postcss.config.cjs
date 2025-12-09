// postcss.config.cjs (가장 안전한 Next.js + Tailwind 설정)
module.exports = {
  plugins: {
    // ❌ tailwindcss: {}, <-- 제거
    autoprefixer: {}, // 👈 이것만 남깁니다.
  },
};