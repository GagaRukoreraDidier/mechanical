import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eefbfc',
          100: '#d2f4f7',
          200: '#a9e9ef',
          300: '#73d9e4',
          400: '#3ac2ce',
          500: '#23A6BD',
          600: '#1a879c',
          700: '#1a6c80',
          800: '#1b5869',
          900: '#1a4a59',
          950: '#0c2d38',
        },
        ink: {
          950: '#010313',
          900: '#050819',
          800: '#0a1024',
          700: '#111a33',
          600: '#1a2542',
          500: '#263254',
          400: '#3a4770',
          300: '#55608f',
          200: '#7b83b0',
          100: '#b3b8d1',
          50: '#e6e8f1',
        },
      },
    },
  },
  plugins: [],
}
export default config
