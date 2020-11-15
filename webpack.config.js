const path = require('path')
const fs = require('fs')
const glob = require('glob')
const webpack = require("webpack")
const frontMatter = require('front-matter')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// Helper
const getYaml = src => frontMatter(fs.readFileSync(src, { encoding: 'utf-8' })).attributes

// Constants
const CONFIG = getYaml('src/config.yml')
const PAGES = []

// Pages data
const pageFiles = glob.sync('src/content/**/*.md')
const htmlWebpackPlugins = pageFiles.map(fileName => {
  const permalink = fileName.replace('src/content/', '/').replace('.md', '')
  const meta = Object.assign({ permalink }, CONFIG.default, getYaml(fileName))
  const options = {
    filename: meta.permalink + '/index.html',
    template: 'src/theme/' + meta.template + '.ejs',
    filesrc: fileName.replace('src/content/', ''),
    data: meta,
    inject: 'body',
  }

  PAGES.push(options)
  
  return new HtmlWebpackPlugin(options)
})

// Webpack
module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 8080,
    historyApiFallback: true,
    hot: true,
    open: true
  },
  entry: {
    "main.js": "./src/theme/main.js",
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: "assets/script/[name]",
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader',
        options: {
          name: 'assets/[path][name].[ext]',
          context: 'src'
        },
      },
      {
        test: /\.css$/i,
        use: [
          
          // {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: {
          //     esModule: false
          //   },
          // },
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
      // {
      //   test: /post\.js$/i,
      //   use: [
      //     {
      //       loader: "file-loader",
      //       options: {
      //           name: "assets/script/[name].[ext]",
      //       },
      //     },
      //     "extract-loader",
      //     "terser-loader"
      //   ],
      // },
      {
        test: /\.ejs$/,
        use: [
          // {
          //   loader: "file-loader",
          //   options: {
          //       name: "assets/[name].[ext]",
          //   },
          // },
          // "extract-loader",
          // { loader: 'html-loader' },

          // {
          //   loader: MiniCssExtractPlugin.loader,
          //   options: {
          //     esModule: false
          //   },
          // },
          // 'html-loader',
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

  // optimization: {
  //   minimizer: [new UglifyJsPlugin()],
  // },

  plugins: [
    // new MiniCssExtractPlugin({
    //   filename: '[name].css',
    //   chunkFilename: '[id].css',
    // }),
    // new webpack.HotModuleReplacementPlugin(),
    ...htmlWebpackPlugins,
    new CleanWebpackPlugin(),

    // new UglifyJsPlugin({
    //   // test: /\.js($|\?)/i,
    //   // sourceMap: true,
    //   // uglifyOptions: {
    //   //   mangle: {
    //   //     keep_fnames: true,
    //   //   },
    //   //   compress: {
    //   //     warnings: false,
    //   //   },
    //   //   output: {
    //   //     beautify: false,
    //   //   },
    //   // },
    // }),
  ]
}
