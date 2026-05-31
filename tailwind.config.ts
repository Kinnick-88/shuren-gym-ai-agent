import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#eef8f2",
          100: "#d6eddf",
          200: "#afdcc2",
          500: "#23885f",
          600: "#1d6f50",
          700: "#165840",
          900: "#0e3328",
        },
        campus: {
          gold: "#c58a1a",
          ink: "#1f2933",
          mist: "#f4f7f5",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(31, 41, 51, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
