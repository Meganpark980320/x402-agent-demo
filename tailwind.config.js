// tailwind.config.js 파일을 새로 만드세요.

/** @type {import('tailwindcss').Config} */
module.exports = {
  // 👇 Next.js App Router의 모든 파일을 스캔하도록 설정
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
    extend: {
      // 프로젝트에서 커스텀 색상 등을 사용한다면 여기에 추가
    },
  },
  plugins: [],
};