// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C2942D",     // Jaune ocre
        secondary: "#1A1A1A",   // Noir/bleu très foncé
        background: "#FFFFFF",  // Blanc
      }
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        activesolution: {
          "primary": "#a8780c",
          "secondary": "#1A1A1A",
          "accent": "#a8780c",
          "neutral": "#1A1A1A",
          "base-100": "#FFFFFF",
          "info": "#60A5FA",
          "success": "#22C55E",
          "warning": "#EAB308",
          "error": "#EF4444",
        },
      },
    ],
  },
}
export default config
