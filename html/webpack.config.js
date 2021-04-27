const path = require("path");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const { VueLoaderPlugin } = require("vue-loader");
const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin");

module.exports = (env, argv) => {
  return {
    devtool: argv.mode === "development" ? "eval-source-map" : false,
    entry: {
      main: [path.resolve(__dirname, "./resources/js/main.js")],
    },
    output: {
      path: path.resolve(__dirname, "./public/"),
      filename: "js/[name].js",
    },
    module: {
      rules: [
        {
          test: /\.(sa|sc|c)ss$/i,
          //exclude: path.resolve(__dirname, "node_modules/"),
          // Loaders run last-to-first.
          use: [
            // Extract CSS for production, inject for development.
            argv.mode === "production"
              ? {
                  loader: MiniCssExtractPlugin.loader,
                  options: {
                    publicPath: "../",
                  },
                }
              : "vue-style-loader",
            // Resolve CSS imports.
            {
              loader: "css-loader",
            },
            // Preprocess Sass/SCSS into CSS.
            {
              loader: "sass-loader",
            },
          ],
          sideEffects: true,
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: "img/[hash][ext][query]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[hash][ext][query]",
          },
        },
        {
          test: /\.js$/i,
          include: path.resolve(__dirname, "resources/js"),
          exclude: path.resolve(__dirname, "node_modules/"),
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.vue$/,
          use: {
            loader: "vue-loader",
          },
        },
      ],
    },
    plugins: [
      // Generates a map bundled modules in output files.
      new BundleAnalyzerPlugin({
        // Disable automatic reporting; use CLI instead.
        // See webpack-bundle-analyzer CLI tool.
        analyzerMode: "disabled",
      }),
      // Extracts CSS into separate files.
      new MiniCssExtractPlugin({
        filename: "css/style.css",
      }),
      new VueLoaderPlugin(),
      // Automatically imports any Vuetify components being used.
      new VuetifyLoaderPlugin(),
    ],
    optimization:
      argv.mode === "production"
        ? {
            minimize: true,
            minimizer: [
              new TerserPlugin({
                terserOptions: {
                  module: true,
                },
                extractComments: false,
              }),
            ],
            usedExports: true,
          }
        : {},
    resolve: {
      modules: [path.resolve("./resources"), path.resolve("./node_modules")],
      symlinks: false,
      alias: {
        vue$: "vue/dist/vue.esm.js",
      },
    },
  };
};
