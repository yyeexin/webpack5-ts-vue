# 前言

Hello，大家好，我是和光不同尘，一个你肯定还没有听说过的新人写手，大家可以叫我和光

最近我又在研究如何用 webpack 搭建 vue+ts 的前端项目了

什么，你说社区有太多类似的文章，你已经看麻了

我也很无奈啊，高深的东西我也整不明白，只能写点入门级的混个脸熟了...

什么，你说你用 vite 用 vue-cli

说实话我也喜欢用，还有 umi，都是很棒的工具，简洁优雅，省时省力，我从小用到大...

奈何总有大佬瞧不上，觉得自己亲手搭建的项目更强，更靠谱，更容易做定制

好吧，大概这就是我这个菜鸡和人家高级前端的差距吧

废话不多说，我们这就操练起来

# 一、基础打包

第一部分先带大家回忆一下 `webpack` 的基础打包流程，我知道这些大家肯定都会的，我只是带大家回忆一下

## 1. 新建项目

找个地方新建名为 `webpack5-ts-vue` 的文件夹，打开终端进入此目录，安装 `webpack` 和 `ts` 相关依赖，初始化项目：

```cmd
mkdir webpack5-ts-vue && cd webpack5-ts-vue

npm install typescript webpack webpack-cli -D

git init
npm init -y
npx tsc --init
```

新建 `.gitignore` 文件，将 `node_modules` 文件夹添加进去，避免 `git` 必要的文件追踪

## 2. 新建入口文件

在项目根目录下新建 `src` 文件夹，新建 `index.ts` 入口文件并添加内容：

```cmd
mkdir src && cd src && touch index.ts
echo "const myName: string = \"和光不同尘\";" > index.ts
```

## 3. 运行打包命令

在 `package.json` 文件中添加打包脚本：

```json
{
  "scripts": {
    "build": "webpack"
  }
}
```

在命令行中运行 `npm run build` ，发现报错了

阅读报错信息可知，`webpack` 没有找到正确的入口文件，并且告诉我们 `webpack` 查找入口文件的默认顺序是：

```
src.js
src.json
src.wasm
src/index.js
src/index.json
src/index.wasm
```

我们的 `index.ts` 文件并不在此列

## 4. 添加 ts 解析工具

`ts` 文件并不是 `webpack` 能直接解析的，所以我们需要使用 `ts-loader` 来专门处理

安装相关依赖：

```cmd
npm i ts-loader -D
```

在项目根目录新建 `webpack` 配置文件 `webpack.config.js`，写入如下内容：

```js
module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
};
```

再次运行打包命令，丝般顺滑，终端没有报错

## 5. 修改配置文件

在生成的 `dist` 目录中点开 `main.js` 文件，发现其中空空如也

这是因为 `webpack` 默认以 `production` 模式运行，会使用 `tree-shaking` 功能对文件内容进行优化

而我们在 `index.ts` 中只有一条声明语句，且并没有使用这个声明的变量，`webpack` 的树摇功能自动删去了这行无用的声明语句，结果就是打包的文件是空文件

我们可以手动声明以 `development` 模式运行：

```js
module.exports = {
  mode: "development",
};
```

再次运行打包命令，现在生成的文件就有内容了

## 6. 生成 html 入口

安装 `html-webpack-plugin` 插件处理 `index.html` 文件，此插件的功能是根据提供的模板文件，自动生成正确的项目入口文件，并把 `webpack` 打包的 `js` 文件自动插入其中

```cmd
npm i html-webpack-plugin -D
```

在项目根目录新建项目入口 `index.html` 模板文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>
```

修改配置文件 `webpack.config.js`：

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  // ...
  plugins: [
    new HtmlWebpackPlugin({
      title: "webpack5-ts-vue",
      template: "./index.html",
    }),
  ],
  // ...
};
```

注意，只在配置文件中设置 `title` 并不起作用，`index.html` 文件需要做相应的修改：

```html
<head>
  <title><%= htmlWebpackPlugin.options.title %></title>
</head>
```

这其实是 `EJS` 模板语法，其中的变量会在打包过程中被某些值替换

## 7. 运行项目

为了能更好的看到效果，我们将 `index.ts` 文件的内容修改的复杂些：

```ts
const myName: string = "和光不同尘";
console.log(myName);

[1, 2, 3].forEach((item) => {
  console.log(item);
});

const isInclude = ["a", "b", "c"].includes("a");
console.log(isInclude);
```

再次运行打包命令，`dist` 目录下生成了 `index.html` 和 `main.js` 两个文件，使用 `VSCode` 的 `live server` 插件或其他能够在本地开启静态资源服务器的工具打开 `index.html` 文件

打开控制台，可以看到在控制台成功输入了预期的结果：

```js
"和光不同尘";
1;
2;
3;
true;
```

这样基础的打包流程就完成了

现在的项目结构如下：

```
webpack5-ts-vue
├── src
│   └── index.ts
├── index.html
├── package-lock.json
├── package.json
├── webpack.config.js
└── tsconfig.json
```

# 二、开发服务器

为了能有更好的开发体验，我们引入 `webpack-dev-server` 开发服务器

```cmd
npm i webpack-dev-server -D
```

在 `webpack.config.js` 添加配置：

```js
module.exports = {
  // ...
  // webpack升级到5.0后，target默认值值会根据package.json中的browserslist改变，导致devServer的自动更新失效，所以development环境下直接配置成web
  target: "web",
  devServer: {
    hot: true, // 启用热模块替换
    open: true, // 打开默认浏览器
  },
  // ...
};
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "serve": "webpack serve"
  }
}
```

这样我们运行 `npm run serve` 开发命令后，默认浏览器会自动打开，当我们修改了文件的内容时，浏览器也会自动刷新

这里我们详细解释一下在实际开发中非常常用的 `proxy` 配置项，它的作用是设置代理，解决开发环境中的跨域问题

其原理是将我们本地发出的请求通过一个中间代理服务器，转发到真正的接口服务器，服务器之间的通信是没有跨域问题的

`proxy` 常用配置项如下：

```json
{
  // ...
  "proxy": {
    "/api": {
      // 需要代理到的真实目标服务器，如/api/user会被代理到https://www.juejin.cn/api/user
      "target": "https://www.juejin.cn",
      // 是否更改代理后请求的headers中host地址，某些安全级别较高的服务器会对此做校验
      "changeOrigin": true,
      // 默认情况下不接受将请求转发到https的api服务器上，如果希望支持，可以设置为false
      "secure": false,
      // 默认情况下/api也会写入到请求url中，通过这个配置可以将其删除
      "pathRewrite": {
        "^/api": "/"
      }
    }
  }
}
```

# 三、配置文件拆分

为了更能体现我们企业级项目开发环境搭建的目标，现在来对 `webpack` 的配置文件进行环境拆分

删除原来的 `webpack.config.js` 文件，新建 `config` 文件夹，新建 `webpack.base.js` 、 `webpack.dev.js` 和 `webpack.prod.js` 三个文件，并安装合并配置文件需要使用的依赖：

```cmd
npm i webpack-merge -D
```

在三个文件中分别写入以下内容：

## 基础配置

```js
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "webpack5-ts-vue",
      template: "./index.html",
    }),
  ],
};
```

## 开发配置

```js
const { merge } = require("webpack-merge");

const baseConfig = require("./webpack.base.js");

module.exports = merge(baseConfig, {
  mode: "development",
  target: "web",
  devServer: {
    hot: true,
    open: true,
  },
});
```

## 生产配置

```js
const { merge } = require("webpack-merge");

const baseConfig = require("./webpack.base.js");

module.exports = merge(baseConfig, {
  mode: "production",
});
```

修改 `npm` 脚本：

```json
{
  "scripts": {
    "build": "webpack --config ./config/webpack.prod.js",
    "serve": "webpack serve --config ./config/webpack.dev.js"
  }
}
```

这样就简单地对配置文件进行了环境上的区分，后续的各种工作只不过是根据不同的需求在不同的配置文件中添加配置而已，当然实际项目中的配置文件要比案例中复杂的多

需要注意的是，配置文件中的路径并没有因为将配置文件放进更深一层的 `config` 文件夹而修改，这是因在 `webpack` 配置中有一个 `context` 属性，该属性用来解析入口（entry point）和加载器（loader），其默认值是 `webpack` 的启动目录，一般就是项目的根目录

# 四、打包各类文件

`webpack` 是一个 `js` 文件打包工具，其他类型的文件一般都需要通过额外的加载器（loader）来实现解析和打包

## vue

安装 `vue3` ：

```cmd
npm i vue@next -S
```

安装 `vue-loader` ：

```cmd
npm install vue-loader -D
```

在 `src` 文件夹下新建 `App.vue` 文件：

```ts
<template>
  <h1>{{ name }}</h1>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  setup() {
    const name = "和光不同尘";
    return {
      name,
    };
  },
});
</script>
```

修改 `index.ts` ：

```js
import { createApp } from "vue";
import App from "./App.vue";

createApp(App).mount("#app");
```

修改 `webpack.base.js` ：

```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
    ],
  },
};
```

现在对代码进行打包依然会报错，根据控制台的报错信息得知对 `.vue` 文件的解析还需要 `@vue/compoiler-sfc` 这个包：

```cmd
npm i @vue/compiler-sfc -D
```

另外，还需要配置对应的 `vue` 插件：

```js
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
  plugins: [new VueLoaderPlugin()],
};
```

这样运行开发命令就已经不报错了，但是浏览器内还是一片空白，并且控制台还报错

这是因为单文件组件被 `vue-loader` 解析成了三个部分，`script` 部分最终交由 `ts-loader` 来处理，但是 `tsc` 并不知道如何处理 `.vue` 结尾的文件

为了解决这个问题，需要给 `ts-loader` 添加一个配置项：

```js
{
  test: /\.ts$/,
  loader: "ts-loader",
  exclude: /node_modules/,
  options: {
    appendTsSuffixTo: [/\.vue$/],
  },
};
```

这样 `.vue` 文件就能完美解析了

## ts

虽然在第一节我们已经介绍过使用 `ts-loader` 处理 `ts` 文件，但是这会存在一个问题：该 `loader` 是把 `typeScript` 转换成 `javaScript` , 只负责新语法的转换，新增的 API 不会自动添加 `polyfill`

为了解决这个问题，我们还是要祭出 `babel`

`babel` 是一个工具链，主要用于旧浏览器或者环境中将 `ECMAScript 2015+` 代码转换为向后兼容版本的
`javaScript` ，包括语法转换、源代码转换等

关注社区的小伙伴可能知道，从 `babel7` 开始 `babel` 已经支持 `ts` 的编译，所以 `ts-loader` 可以弃用了

安装 `babel` 相关依赖：

```cmd
npm i babel-loader @babel/core @babel/preset-env @babel/preset-typescript -D
```

修改 `webpack.base.js` ：

```js
module.epxorts = {
  module: {
    rules: [
      {
        test: /\.(t|j)s$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },
};
```

在项目根目录添加 `babel.config.js` 文件：

```js
module.exports = {
  presets: [
    "@babel/preset-env",
    [
      "@babel/preset-typescript",
      {
        allExtensions: true, //支持所有文件扩展名
      },
    ],
  ],
};
```

现在可以安心的卸载 `ts-loader` 了

## scss

给 `App.vue` 文件添加样式，我使用了 `scss`，不出意外的报错了，因为缺少相应的 `loader`

```cmd
npm i css-loader style-loader postcss-loader postcss-preset-env sass-loader sass -D
```

在 `webpack.base.js` 中添加配置：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: ["style-loader", "css-loader", "postcss-loader", "sass-loader"],
      },
    ],
  },
  // ...
};
```

这里需要强调一下 `loader` 的应用顺序是从右往左，从下往上的

`postcss` 是一个加工样式文件的工具，可以提供自动添加样式前缀、修改单位等功能，具体使用了什么功能取决于你提供了哪些 `postcss` 插件，这些插件可以直接配置在 `loader` 中，更好的做法是在项目的根目录提供一份单独的配置文件

在一些陈旧的项目中可能会看到 `autoprefixer` 这个插件，现在我们可以直接使用 `postcss-preset-env` 这个插件，自动添加前缀的功能已经包含在了其中

在项目根目录下新增 `postcss.config.js` 配置文件：

```js
module.exports = {
  plugins: ["postcss-preset-env"],
};
```

如果在项目中你选择了 `less` ，只需安装 `less-loader` ，再修改少量的配置即可

## img

在 `webpack5` 之前，加载图片、字体等资源需要我们使用 `url-loader`、 `file-loader` 等来处理

从 `webpack5` 开始，我们可以使用内置的资源模块类型 [Asset Modules type](https://webpack.js.org/guides/asset-modules/)，来替代这些 `loader` 的工作

资源模块类型 `Asset Modules type` 分为四种：

- `asset/resource` 发送一个单独的文件并导出 URL，之前通过使用 `file-loader` 实现
- `asset/inline` 导出一个资源的 data URI，之前通过使用 `url-loader` 实现
- `asset/source` 导出资源的源代码，之前通过使用 `raw-loader` 实现
- `asset` 在导出一个 data URI 和发送一个单独的文件之间自动选择，之前通过使用 `url-loader` 实现，并且可以配置资源体积限制

```js
module.epxorts = {
  module: {
    rules: [
      {
        test: /\.(png|svg|jpe?g|gif)$/,
        type: "asset",
        generator: {
          filename: "images/[name]-[hash][ext]",
        },
      },
    ],
  },
};
```

需要注意的是这里的 `[ext]` 扩展名通配符包含了 `.` ，我们不需要额外再写，跟别的 `loader` 有所区别

## font

同上，这里不再赘述

```js
module.epxorts = {
  module: {
    rules: [
      {
        test: /\.(eot|svg|ttf|woff2?|)$/,
        type: "asset/resource",
        generator: {
          filename: "fonts/[name]-[hash][ext]",
        },
      },
    ],
  },
};
```

# 五、其他

## 1. 注入环境变量

为了跨终端设置环境变量，我们使用 cross-env 这个工具

```cmd
npm i cross-env -D
```

修改 npm 脚本

```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production webpack --config ./config/webpack.prod.js",
    "serve": "cross-env NODE_ENV=development webpack serve --config ./config/webpack.dev.js"
  }
}
```

这样在 webpack 的配置文件中，可以通过`process.env.NODE_ENV`读取到当前设置的环境变量，我们可以根据这个变量来做一些配置优化

## 2. 提取样式文件

webpack 官方文档中有这样一段描述：

> For production builds it's recommended to extract the CSS from your bundle being able to use parallel loading of CSS/JS resources later on. This can be achieved by using the mini-css-extract-plugin, because it creates separate css files. For development mode (including webpack-dev-server) you can use style-loader, because it injects CSS into the DOM using multiple and works faster.

大意是建议我们在生产环境使用 mini-css-extract-plugin 这个工具来抽离样式文件，这样在浏览器中可以拥有更好的加载效率

安装相关依赖

```cmd
npm i mini-css-extract-plugin -D
```

在 webpack.base.js 基础配置文件中做如下修改

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader",
        ],
      },
    ],
  },
};
```

在 webpack.prod.js 生产配置文件中添加插件

```js
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(baseConfig, {
  plugins: [new MiniCssExtractPlugin()],
});
```

这样在开发环境，我们依然使用 style-loader 有更高的开发效率

## 3. 自动拷贝文件

当某些文件不需要经过 webpack 打包而直接使用，如一些三方脚本 js 文件等等，我们可以使用`copy-webpack-plugin`这个插件直接进行文件的拷贝

例如我们有一个 lodash.min.js 文件放在了 public 文件夹下，现在我们想在项目中使用，有两个方案：

- 方案一：在 index.js 入口文件中直接导入

```js
import "../public/lodash.min.js";
```

这种方案可行，但是会经过 webpack 打包处理，完全没有必要，降低了打包效率

- 方案二：在 index.html 中用 script 标签引入

```html
<script src="./public/lodash.min.js"></script>
```

在开发环境一切正常，但是当你打包后发布到服务器上你会发现，lodash.min.js 文件并不能正确加载，这是因为 webpack 并不会解析 index.html 中引用的文件进行打包，所以需要我们手动处理

```cmd
npm i copy-webpack-plugin -D
```

修改 webpack.prod.js

```js
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = merge(baseConfig, {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: "./public", to: "./public" }],
    }),
  ],
});
```

这里需要补充说明一下为什么在开发环境可以正常运行，主要是因为 webpack-dev-server 有一个功能，浏览器请求的文件如果不是通过 webpack 提供，则默认到项目根目录中寻找

devServer 启动信息：

```
Content not from webpack is served from D:\github-workspaces\webapck-ts-vue
```

然后再根据我们在 index.html 配置的`./public/lodash.min.js`路径，就能正确找到静态资源的位置

## 4. 清理打包目录

在 webpack5 之前，我们都习惯于使用一款名叫 clean-webpack-plugin 的插件清理 dist 目录，从 webpack5 开始自带了清理打包目录的功能，只需在生产环境的配置文件中增加一个配置即可

```js
module.exports = merge(baseConfig, {
  output: {
    clean: true,
  },
});
```

## 5. 省略拓展名

`extensions` 配置项的功能是解析到文件时自动添加扩展名，其默认值为 `['.wasm', '.mjs', '.js', '.json']` ，我们可以根据需求将 `.vue` 也加入其中，虽然会带来一些便利，但实际上会在一定程度上影响 `webpack` 的运行效率，不推荐修改

```js
module.exports = {
  resolve: {
    extensions: [".vue"],
  },
};
```

## 6. 设置路径别名

`alias` 是一个非常和好用的配置项，当我们项目的目录结构比较深时，或者一个文件的路径可能需要 `../../` 这种路径片段才能访问到的时候，我们可以给一些常用的路径设置别名

```js
const path = require("path");

module.exports = {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
};
```

这样在代码中就能通过别名的方式引入文件

```js
import App from "@/App.vue";
```

## 7. 友好打包提示

现在 webpack 原生的控制台输出已经挺好看的了，都是些有用的信息，没必要用这个了，而且刚刚去它的仓库搂了一眼，上一次更新已经是三年前了，装不装大家随意吧

```cmd
npm i friendly-errors-webpack-plugin -D
```

修改 webpack.dev.js

```js
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

modules.exports = {
  // ...
  plugins: [new FriendlyErrorsWebpackPlugin()],
  // ...
};
```

## 8. 包文件分析

```cmd
npm i webpack-bundle-analyzer -D
```

修改 webpack.prod.js

```js
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
  plugins: [
    // ...
    new BundleAnalyzerPlugin({
      analyzerMode: "disabled",
      generateStatsFile: true,
    }),
    // ...
  ],
};
```

这样每次打包完成之后，都会在打包文件目录中生成一个 stats.json 文件

在 package.json 中添加脚本

```json
{
  "scripts": {
    "analyze": "webpack-bundle-analyzer --port 3000 ./dist/stats.json"
  }
}
```

运行 npm run analyze 即可自动打开包文件分析页面

# 六、工程化

再来一些锦上添花的项目工程化配置

## ESLint

ESLint 用于检查代码规则，在开发过程中根据你提供的规则做检验，并给出错误提示

在项目中安装 eslint 依赖：

```cmd
npm i eslint -D
```

运行 eslint 初始化 命令，根据提示进行选择，选择完毕后会自动安装相关依赖，并在项目根目录生成 eslint 配置文件：

```cmd
npx eslint --init
$ √ How would you like to use ESLint? · problems
$ √ What type of modules does your project use? · esm
$ √ Which framework does your project use? · vue
$ √ Does your project use TypeScript? · No / Yes
$ √ Where does your code run? · browser
$ √ What format do you want your config file to be in? · JavaScript
$ The config that you've selected requires the following dependencies:

@typescript-eslint/parser  @typescript-eslint/eslint-plugin eslint-plugin-vue
```

[typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint) 是 ts 官方提供的 ESLint 插件

[eslint-plugin-vue](https://eslint.vuejs.org/) 是 vue 官方提供的 ESLint 插件

结合两份文档对生成的 .eslintrc.js 配置文件适当修改后，最后的内容如下：

```js
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: 12,
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  plugins: ["vue", "@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
  ],
  rules: {},
};
```

查阅 eslint-loader 文档后得知这个 loader 已经被官方废弃，推荐使用新方案 eslint-webpack-plugin

```cmd
npm i eslint-webpack-plugin -D
```

在 webpack.dev.js 中添加配置：

```js
const ESLintPlugin = require("eslint-webpack-plugin");

module.exports = {
  // ...
  // 注意如果不声明文件扩展名，eslint默认只会检查js结尾的文件
  plugins: [new ESLintPlugin({ extensions: ["js", "ts", "vue"] })],
  // ...
};
```

这样在运行开发命令后，在终端中就能拥有良好的代码规范提示

## Prettier

统一的编码风格也有助于团队成员之间的协同合作

当你接到一个需求，打开别人的代码，发现从来没有进行过格式化，这是一件相当恐怖的事情

可能你只需要改少量的代码，但因为你想要格式化整个文本让它变得美观好看，最终导致在代码仓库中显示更改了整个文件，难以追踪实际的代码变化

为了解决这个问题，我们在项目中加入 prettier 的支持

```cmd
npm i prittier eslint-config-prettier eslint-plugin-prettier -D
```

添加.prettierrc 配置文件

```json
{
  "printWidth": 80
}
```

这里我们只指定一个行宽，其它配置全部使用 prettier 的默认值，这也符合 prettier 这个工具的设计理念，它本身提供的配置项就非常少，目的就是不希望用户随意更改，这也才能在更大程度上保持统一

添加 .prettierignore 配置文件

```
dist/
node_modules
```

修改 .eslintrc.js

```js
module.exports = {
  // ...
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:vue/vue3-recommended",
    "plugin:prettier/recommended",
  ],
  // ...
};
```

注意一定要将 prettier 的插件放在最后一个

这样就将 eslint 和 prettier 整合到了一起，每多写一个空格或少些一个分号，控制台都会有大红叉报错提醒，非常的赏心悦目

## lint-staged

如果在整个项目上运行 lint 效率会非常底下，更好的做法是只让进入暂存区的文件做代码校验，这会节约很多时间，我们需要使用的工具是 lint-staged

```cmd
npm i lint-staged -D
```

添加 lint-staged.config.js 配置文件

```js
module.exports = {
  "src/**/*.{js,ts,vue}": [
    "eslint --fix --ext .js,.ts,.vue",
    "prettier --write",
  ],
};
```

这样在命令行执行 `npx lint-staged` 就能手动在暂存区运行 eslint+prettier 做代码风格校验了

## husky

为了确保进入 git 仓库的代码都是符合代码规则且拥有统一风格，在代码提交之前，我们还需要强制进行一次代码校验，使用 husky（哈士奇），能够在我们做代码提交动作（commit）的时候自动运行代码校验命令

```cmd
npm i husky -D
```

我们安装的是 6.0 版本以上的 husky，根据文档先在 package.json 中添加一条脚本：

```json
{
  "prepare": "husky install"
}
```

运行 husky 安装脚本

```cmd
npm run prepare
```

运行完此命令会在项目根目录下生成一个.husky 文件夹

添加一个 git hook：

```cmd
npx husky add .husky/pre-commit "npx lint-staged"
```

执行完此命令后，会在 .husky 目录下自动生成一个 pre-commit 文件，但是经过我在公司 windows 电脑上的测试并没有成功生成，所以我们手动添加这个文件

在.husky 目录下新建 pre-commit 文件，写入一下内容：

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

现在每当你执行 commit 操作时，都会自动执行 lint-staged 做规则校验，如果 lint 没有通过，则会 abort 当前的 commit 操作，直到你修复完了所有的 error 才能成功 commit

# 写在最后

到这里 webpack 基础的东西就写完了，不过我也只会这些基本的东西，囿于本人有限的技术水平，文章中肯定存在不少疏漏和没有讲清楚的地方，欢迎各位批评指正

尽管如此以上内容还是花费了我不少气力，写作过程中需要大量的测试和验证，生怕误人子弟。究其原因还是 webpack 工具链流程太长，每个工具都包含大量的配置，想把每个配置的具体作用都摸清楚实在不是一件容易的事，难怪坊间流传大厂都有 webpack 配置工程师这么一说

我们也能大致预料到，自己配置出来的项目大概率是一个次优化的产物，肯定还存在大量改进的空间。既然如此我更愿意相信社区的力量，在实际的工作过程中使用社区里更成熟的脚手架工具，它们有全职的开发者维护，投入的精力肯定比我个人甚至是绝大多数像我一样的普通开发者多得多，且经过社区的检验应该是相当靠谱的，我们没有必要钻牛角尖

写这篇文章更主要的原因是自己最近在复习，巩固基础，现在正好学到了 webpack 部分，就顺手做一些总结，供自己以后回顾。如果碰巧你正好也能用得上，那我万分欣喜

本人工作于杭州，活跃于长三角一带，如果有需要的话可以加我微信：iseeyexin，我们可以互相交流，共同进步

```
webpack5-ts-vue
├── README.md
├── babel.config.js
├── config
│   ├── webpack.base.js
│   ├── webpack.dev.js
│   └── webpack.prod.js
├── index.html
├── lint-staged.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── public
│   ├── favicon.ico
│   └── lodash.min.js
├── src
│   ├── App.vue
│   ├── assets
│   │   ├── fonts
│   │   │   ├── iconfont.css
│   │   │   ├── iconfont.ttf
│   │   │   ├── iconfont.woff
│   │   │   └── iconfont.woff2
│   │   └── images
│   │       └── test.jpg
│   ├── index.ts
│   └── shims-vue.d.ts
└── tsconfig.json
```
