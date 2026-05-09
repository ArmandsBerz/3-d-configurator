module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        {
          module: /svg2pdf\.js/,
          message: /Failed to parse source map/,
        },
      ];
      return webpackConfig;
    },
  },
};