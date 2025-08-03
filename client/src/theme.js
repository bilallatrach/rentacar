
// mui theme settings
export const themeSettings = () => {
  return {
    palette: {
      primary: {
        dark: "#006B7D",
        main: "#007A7A",
        light: "#E6FBFF",
        extra: "#D27907",
      },
      neutral: {
        dark: "#333333",
        main: "#666666",
        mediumMain: "#858585",
        medium: "#A3A3A3",
        light: "#F0F0F0",
      },
      background: {
        default: "#FFFFFF",
        alt: "#f5f2f1",
      },
    },
    typography: {
      fontFamily: ["Jost", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 14,
      },
      medium: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 12,
      },
      small: {
        fontFamily: ["Jost", "sans-serif"].join(","),
        fontSize: 10,
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            // Outlined
            "& .MuiOutlinedInput-root": {
              fontSize: "16px",
            },
            "& .MuiInputLabel-outlined": {
              fontSize: "16px",
            },
          },
        },
      },
    },
  };
};
