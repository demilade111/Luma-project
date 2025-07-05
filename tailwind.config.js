/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.{html,js}",
    "./src/**/*.{html,js}",
    "./components/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['"Nunito Sans"', "sans-serif"],
      },
      boxShadow: {
        "sidebar-glow":
          "3.276px 6.427px 6.049px rgba(0, 5, 16, 0.7), -3.276px -6.427px 6.049px rgba(46, 51, 62, 0.7)",
      },
      backgroundImage: {
        "gradient-to-top-dark":
          "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
        "picsum-1": "url('https://picsum.photos/1')",
      },
    },
  },
  plugins: [],
};
