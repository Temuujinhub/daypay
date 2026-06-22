import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // DayPay brand (spec §6.3): Teal #00A896 + white.
        brand: {
          DEFAULT: "#00A896",
          dark: "#028090",
          light: "#02C39A",
        },
      },
    },
  },
  plugins: [],
};

export default config;
