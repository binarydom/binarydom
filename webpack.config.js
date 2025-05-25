const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const Dotenv = require("dotenv-webpack");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  entry: "./src/index.ts",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: isProduction ? "[name].[contenthash].js" : "[name].js",
    clean: true,
    publicPath: "/",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              cacheDirectory: true,
            },
          },
          {
            loader: "source-map-loader",
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: !isProduction,
              modules: {
                auto: true,
                localIdentName: isProduction
                  ? "[hash:base64:8]"
                  : "[name]__[local]--[hash:base64:5]",
              },
            },
          },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: !isProduction,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: !isProduction,
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new Dotenv({
      path: isProduction ? ".env.production" : ".env.development",
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      minify: isProduction,
    }),
    ...(isProduction
      ? [
          new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css",
          }),
          new CompressionPlugin({
            test: /\.(js|css|html|svg)$/,
            algorithm: "gzip",
          }),
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false,
            reportFilename: "bundle-report.html",
          }),
        ]
      : []),
  ],
  optimization: {
    minimize: isProduction,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: isProduction,
            drop_debugger: isProduction,
          },
          mangle: true,
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: {
      chunks: "all",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: "single",
  },
  devtool: isProduction ? "source-map" : "eval-source-map",
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    proxy: {
      "/api": {
        target: process.env.API_URL,
        changeOrigin: true,
      },
    },
  },
  performance: {
    hints: isProduction ? "warning" : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },
};
