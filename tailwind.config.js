const c = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Colors resolve to CSS variables defined per theme in src/index.css
      colors: {
        bg: c('bg'),
        surface: c('surface'),
        subtle: c('subtle'),
        line: c('line'),
        ink: c('ink'),
        muted: c('muted'),
        accent: {
          DEFAULT: c('accent'),
          hover: c('accent-hover'),
          fg: c('accent-fg'),
          soft: c('accent-soft'),
        },
        danger: c('danger'),
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang TC"',
          '"Noto Sans TC"', '"Microsoft JhengHei"', 'Roboto', 'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
