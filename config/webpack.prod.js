const { merge } = require("webpack-merge");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const baseConfig = require("./webpack.base.js");

module.exports = merge(baseConfig, {
  mode: "production",
  output: {
    clean: true,
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "./public", to: "./public" }],
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled",
      generateStatsFile: true,
    }),
  ],
});
