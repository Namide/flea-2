const fs = require('fs')
const glob = require('glob')
const frontMatter = require('front-matter')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Helper
const getYaml = src => frontMatter(fs.readFileSync(src, { encoding: 'utf-8' })).attributes

// Constants
const CONFIG = getYaml('config.yml')
const PAGES = []
const requireList = []

// Pages data
const pageFiles = [
    ...glob.sync('content/**/*.md'),
    ...glob.sync('content/**/*.html')
  ]
  .filter(fileName => !/^content\/static\//si.test(fileName))

const htmlWebpackPlugins = pageFiles
  .map(fileName => {
    const ext = fileName.split('.').pop()
    const permalink = fileName
      .replace('content/', '/')
      .replace('.' + ext, '')
    const meta = Object.assign({ permalink }, CONFIG.default, getYaml(fileName))

    meta.pages = PAGES
    meta.filesrc = fileName.replace('content/', '')
    const filename = meta.permalink !== '/' ? meta.permalink.substring(1) + '/index.html' : 'index.html'
    const options = {
      filename,
      template: 'theme/' + meta.template + '.ejs',
      data: meta,
      inject: false
    }

    if (ext === 'md') {
      requireList.push(`list['${meta.filesrc}'] = require('html-loader!markdown-loader!metaless-loader!./content/${meta.filesrc}')`)
    } else if (ext === 'html') {
      requireList.push(`list['${meta.filesrc}'] = require('html-loader!metaless-loader!./content/${meta.filesrc}')`)
    }

    const page = JSON.parse(JSON.stringify(meta))
    delete page.pages
    PAGES.push(page)
    console.log('Page: ' + meta.permalink)

    return new HtmlWebpackPlugin(options)
  })

console.log('Page count:', pageFiles.length, '\n')

fs.writeFileSync(
  './.flea-cache.pages.js',
  `const list = {}\n${ requireList.join('\n') }\nmodule.exports = list`
)

module.exports = {
  htmlWebpackPlugins
}
