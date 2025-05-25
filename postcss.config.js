module.exports = {
  plugins: [
    require("postcss-preset-env")({
      stage: 3,
      features: {
        "nesting-rules": true,
        "custom-properties": true,
        "custom-media-queries": true,
        "color-mod-function": true,
      },
    }),
    require("postcss-nested"),
    require("autoprefixer"),
    require("cssnano")({
      preset: [
        "default",
        {
          discardComments: {
            removeAll: true,
          },
          normalizeWhitespace: true,
          minifyFontValues: true,
          minifyGradients: true,
        },
      ],
    }),
  ],
};
