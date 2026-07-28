/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        govBlue: "#154c84",
        govGold: "#f1c232",
        govInk: "#1f2933",
        govSoftBlue: "#eef5fc",
        govHeader: "#0b2848",
        govHeaderDark: "#07182d",
        brand: {
          50: "#f0f5fa",
          100: "#e0ecf6",
          200: "#c2d9ee",
          300: "#94bce2",
          400: "#6098d2",
          500: "#3a78bf",
          600: "#285ea3",
          700: "#1e4a84",
          800: "#153866",
          900: "#0e2647",
          950: "#08172c",
        },
      },
    },
  },

  plugins: [],
};