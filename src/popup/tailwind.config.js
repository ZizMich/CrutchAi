/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: '#3b82f6',
          dark: '#2563eb',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: '#9ca3af',
          dark: '#4b5563',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: '#ef4444',
          dark: '#dc2626',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: '#10b981',
          dark: '#059669',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#2563eb',
          secondary: '#4b5563',
          error: '#dc2626',
          success: '#059669',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#3b82f6',
          secondary: '#9ca3af',
          error: '#ef4444',
          success: '#10b981',
        },
      },
    ],
    darkTheme: 'dark',
    base: true,
    styled: true,
    utils: true,
    logs: true,
  },
}
