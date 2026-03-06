/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {
      zIndex: Array.from({ length: 300 }).reduce((acc, _, i) => {
        acc[i + 1] = i + 1;
        return acc;
      }, {}),
      spacing: Array.from({ length: 300 }).reduce((acc, _, i) => {
        const value = i + 1;
        acc[value] = `${value}px`;
        return acc;
      }, {}),
      fontFamily: {
        sans: ["SF Pro Display", "sans-serif"],
        serif: ["Roslindale", "serif"],
        sfpro: ["SF Pro Display", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
        roslindale: ["Roslindale", "sans-serif"],
        constantine: ["Constantine", "sans-serif"],
        basier: ["Basier", "sans-serif"],
        helvetica: ["Helvetica Neue", "sans-serif"],
        garamond: ["GaramondPro", "sans-serif"],
        rubik: ["Rubik", "sans-serif"],
        tupa: ["Tupa Nova", "sans-serif"],
        copernicus: ["Copernicus", "sans-serif"],
        proxima: ["Proxima Nova", "sans-serif"],
      },
      fontSize: (theme) => ({
        ...theme("spacing"),
      }),
      rounded: (theme) => ({
        ...theme("spacing"),
      }),
      lineHeight: (theme) => ({
        ...theme("spacing"),
      }),
      borderRadius: (theme) => ({
        ...theme("spacing"),
      }),
      fontWeight: {
        100: "100",
        200: "200",
        300: "300",
        400: "400",
        500: "500",
        600: "600",
        700: "700",
        800: "800",
        900: "900",
      },
      colors: {
        "secondary-white": "#F1F1F1",
      },
    },
  },
  plugins: [],
};
