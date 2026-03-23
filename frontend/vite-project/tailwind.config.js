/** @type {import('tailwindcss').Config} */
export default {
  content: ["../index.html", "../src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(148, 163, 184, 0.12), 0 24px 80px rgba(15, 23, 42, 0.42)",
      },
      colors: {
        slate: {
          975: "#060816",
        },
      },
      backgroundImage: {
        "mesh-dark":
          "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 28%), radial-gradient(circle at top right, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at 20% 80%, rgba(251,191,36,0.12), transparent 25%), linear-gradient(180deg, #07111f 0%, #050914 48%, #03050c 100%)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        rise: "rise 0.55s ease-out both",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        rise: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
