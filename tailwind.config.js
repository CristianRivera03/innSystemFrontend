/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        // Alias retrocompat — apuntan a CSS variables Carbon
        main: 'var(--cds-background)',
        card: 'var(--cds-layer-01)',
        input: 'var(--cds-layer-01)',
        brand: 'var(--cds-interactive)',
        'text-main': 'var(--cds-text-primary)',
        'text-muted': 'var(--cds-text-secondary)',
        'border-main': 'var(--cds-border-subtle)',
        // Carbon semánticos
        'cds-success': 'var(--cds-support-success)',
        'cds-warning': 'var(--cds-support-warning)',
        'cds-error': 'var(--cds-support-error)',
        'cds-info': 'var(--cds-support-info)',
      },
    },

    //animaciones
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(16px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      }
    },

    animation: {
      'fade-in': 'fadeIn 0.2s cubic-bezier(0.2, 0, 0.38, 0.9)',
      'slide-up': 'slideUp 0.24s cubic-bezier(0.2, 0, 0.38, 0.9)',
    }
  },
  plugins: [],
}