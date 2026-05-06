import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        secondary: '#164E63',
        accent: '#F59E0B'
      }
    }
  },
  plugins: []
};

export default config;
