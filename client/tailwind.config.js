// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          dark: "#0F0F0F",
          DEFAULT: "#232D3F",
          light: "#005B41",
          lighter: "#008170",
        },
      },
    },
  },
  plugins: [],
};
