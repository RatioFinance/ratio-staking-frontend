const path = require("path");

module.exports = {
  webpack: {
    resolve: {
      extensions: ['*', '.mjs', '.js', '.vue', '.json']
    },
    configure: (webpackConfig, _) => {
      webpackConfig.module.rules.push({
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      });
      return webpackConfig;
    }
  }
};