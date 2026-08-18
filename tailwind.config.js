/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        go: {
          verde: "#19A32A",
          amarelo: "#FFDE00",
          azul: "#00509F",
          azulEscuro: "#003B75",
          branco: "#FFFFFF",
        },
        status: {
          verde: "#19A32A",
          amarelo: "#B98A00",
          vermelho: "#C22B2B",
          cinza: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
