/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  
  content: ["./index.html", "./src/**/*.{js,jsx}"],

  theme: {
    extend: {
      colors: {
        govBlue: "#0b3b82",
        govGold: "#f1c232",
        govInk: "#1f2933",
        govSoftBlue: "#e8f1ff",
      },
    },
  },

  plugins: [],
};