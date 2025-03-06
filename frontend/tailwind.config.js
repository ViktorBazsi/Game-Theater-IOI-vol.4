/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      backgroundImage: {
        "logo-pattern": "url('/Public/GT_001.png')",
      },
    },
  },
  plugins: [],
};
