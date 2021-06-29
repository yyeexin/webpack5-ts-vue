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
  target: "web",
  plugins: [
    new ESLintPlugin({ extensions: ["js", "ts", "vue"] }),
    new FriendlyErrorsWebpackPlugin(),
  ],
});
