/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#10B981", // Emerald 500
          dark: "#059669",    // Emerald 600
        },
        secondary: {
          DEFAULT: "#6366F1", // Indigo 500
          dark: "#4F46E5",    // Indigo 600
        },
        background: {
          DEFAULT: "#0F172A", // Slate 900
          light: "#1E293B",   // Slate 800
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} 