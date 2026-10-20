import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          dark: '#12372A',     // Deep forest night
          primary: '#1B4D3E',  // Deep agricultural forest green
          medium: '#2E7D32',   // Vibrant crop leaf green
          light: '#43A047',    // Fresh shoot green
          subtle: '#E8F5E9',   // Light mint highlight
          accent: '#D97706',   // Harvest wheat / saffron amber
          alert: '#DC2626',    // Mandi alert red
          surface: '#FFFFFF',
          background: '#F8F6F0', // Earthy warm off-white
          card: '#FFFFFF',
          muted: '#6B7280',
          border: '#E5E7EB',
          earth: '#8D6E63',    // Soil neutral
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'agri-sm': '0 1px 3px rgba(18, 55, 42, 0.08), 0 1px 2px rgba(18, 55, 42, 0.04)',
        'agri-md': '0 4px 6px -1px rgba(18, 55, 42, 0.08), 0 2px 4px -1px rgba(18, 55, 42, 0.04)',
        'agri-lg': '0 10px 15px -3px rgba(18, 55, 42, 0.08), 0 4px 6px -2px rgba(18, 55, 42, 0.04)',
      }
    },
  },
  plugins: [],
};

export default config;
