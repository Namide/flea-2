const path = require('path')
const fs = require('fs')
const glob = require('glob')
const frontMatter = require('front-matter')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin")

// Helper
const getYaml = src => frontMatter(fs.readFileSync(src, { encoding: 'utf-8' })).attributes

// Constants
const CONFIG = getYaml('src/config.yml')
const PAGES = []

// Pages data
const pageFiles = glob.sync('src/content/**/*.md')
  .filter(fileName => !/^src\/content\/static\//si.test(fileName))
let pagesRequire = ''
const htmlWebpackPlugins = pageFiles
  .map(fileName => {

    const permalink = fileName.replace('src/content/', '/').replace('.md', '')
    const meta = Object.assign({ permalink }, CONFIG.default, getYaml(fileName))
    const filesrc = fileName.replace('src/content/', '')
    const options = {
      filesrc,
      filename: meta.permalink + '/index.html',
      template: 'src/theme/' + meta.template + '.ejs',
      data: meta,
      inject: false,
    }

    pagesRequire += `list['${filesrc}'] = require('html-loader!markdown-loader!metaless-loader!../content/${filesrc}')\n` 

    PAGES.push(options)
    
    console.log('Page: /' + meta.permalink)
    
    return new HtmlWebpackPlugin(options)
  })

fs.writeFileSync('src/theme/_pages.js', 'const list = {}\n' + pagesRequire + 'module.exports = list')
console.log('Page count:', pageFiles.length, '/n')

// Webpack
module.exports = env => {

  const isDev = !!env.development
  const isProd = !!env.production

  return {

    // mode: 'production',
    mode: isProd ? "production" : "development",
    watch: isDev,
  
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      port: 8080,
      historyApiFallback: true,
      hot: isDev,
      open: true
    },

    entry: {
      "main.js": "./src/theme/script/main.js",
    },

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: "assets/script/[name]",
      publicPath: '/'
    },

    module: {
      rules: [
        {
          test: /\.(svg|png|jpe?g|gif)$/i,
          loader: 'file-loader',
          options: {
            name: 'assets/[path][name].[ext]',
            context: 'src'
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
                  name: "assets/style/[name].[ext]",
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
          { from: "src/content/static", to: "" }
        ],
      }),
    ]
  }
}
