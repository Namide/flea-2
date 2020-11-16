const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin")
const { htmlWebpackPlugins } = require('./pages.js')


// Webpack
module.exports = env => {

  const isDev = !!env.development
  const isProd = !!env.production

  return {

    // mode: 'production',
    mode: isProd ? "production" : "development",
    watch: isDev,
  
    devServer: {
      contentBase: path.join(__dirname, '../dist'),
      port: 8080,
      historyApiFallback: true,
      hot: isDev,
      open: true
    },

    entry: {
      "main.js": "./theme/script/main.js",
    },

    output: {
      path: path.resolve(__dirname, '../dist'),
      filename: "assets/script/[name]",
      publicPath: '/'
    },

    module: {
      rules: [
        {
          test: /\.(svg|png|ico|jpe?g|gif)$/i,
          loader: 'file-loader',
          options: {
            name: 'assets/[path][name].[ext]',
            // context: 'src'
          },
        },
        {
          test: /\.css$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                  name: "assets/style/[name].[ext]",
              },
            },
            "extract-loader",
            'css-loader'
          ],
        },
        {
          test: /\.scss$/i,
          use: [
            {
              loader: "file-loader",
              options: {
                name: "assets/style/[name].css",
              },
            },
            "extract-loader",
            'css-loader',
            'sass-loader'
          ],
        },
        {
          test: /\.ejs$/,
          use: [
            {
              loader: 'ejs-loader',
              options: {
                esModule: false
              }
            },
          ],
        }
      ]
    },

    plugins: [
      ...htmlWebpackPlugins,
      new CleanWebpackPlugin(),
      new CopyPlugin({
        patterns: [
          { from: "content/static", to: "" }
        ],
      }),
    ]
  }
}
