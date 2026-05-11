import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bege: '#F6EDE7',
          begeEsc: '#E8D8CE',
          rosa: '#ED71A2',
          rosaDeep: '#D84E86',
          roxo: '#7684BF',
          roxoDeep: '#5E6BA6',
          ciano: '#58C2E0',
          marrom: '#422716',
          branco: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Quicksand', 'sans-serif'],
        mono: ['"Space Grotesk"', 'sans-serif'],
      },
      animation: {
        drip: 'drip 1s ease-out forwards',
        float: 'float 3s ease-in-out infinite',
        marquee: 'marquee 24s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        sprinkle: 'sprinkle-fall 8s linear infinite',
      },
      keyframes: {
        drip: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'top' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'sprinkle-fall': {
          '0%': { transform: 'translateY(-20px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
