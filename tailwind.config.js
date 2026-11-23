/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          950: '#06090e',
          900: '#0b111a',
          850: '#111927',
          800: '#172235',
          700: '#23334d',
          600: '#344b6e',
          500: '#4e6b99',
          400: '#7594c4',
          300: '#a3beea',
          200: '#d1e0f8',
          100: '#edf4fd',
        },
        cyanPulse: '#00e5ff',
        amberGlow: '#f59e0b',
        boneIvory: '#e8dfd5',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
