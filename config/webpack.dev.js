const { merge } = require("webpack-merge");

const ESLintPlugin = require("eslint-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

const baseConfig = require("./webpack.base.js");

module.exports = merge(baseConfig, {
  mode: "development",
  devtool: "source-map",
  devServer: {
    hot: true,
    open: true,
  },
  // webpack升级到5.0后，target默认值值会根据package.json中的browserslist改变，导致devServer的自动更新失效。所以development环境下直接配置成web。
  target: "web",
  plugins: [
    new ESLintPlugin({ extensions: ["js", "ts", "vue"] }),
    new FriendlyErrorsWebpackPlugin(),
  ],
});
