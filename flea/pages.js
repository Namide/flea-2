const fs = require('fs')
const glob = require('glob')
const frontMatter = require('front-matter')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// Helper
const getYaml = src => frontMatter(fs.readFileSync(src, { encoding: 'utf-8' })).attributes

// Constants
const CONFIG = getYaml('src/config.yml')
const PAGES = []
const requireList = []

// Pages data
const pageFiles = [
    ...glob.sync('src/content/**/*.md'),
    ...glob.sync('src/content/**/*.html')
  ]
  .filter(fileName => !/^src\/content\/static\//si.test(fileName))

const htmlWebpackPlugins = pageFiles
  .map(fileName => {
    const ext = fileName.split('.').pop()
    const permalink = fileName
      .replace('src/content/', '/')
      .replace('.' + ext, '')
    const meta = Object.assign({ permalink }, CONFIG.default, getYaml(fileName))

    meta.pages = PAGES
    meta.url = '/' + meta.permalink
    meta.filesrc = fileName.replace('src/content/', '')
    const options = {
      filename: meta.permalink + '/index.html',
      template: 'src/theme/' + meta.template + '.ejs',
      data: meta,
      inject: false
    }

    if (ext === 'md') {
      requireList.push(`list['${meta.filesrc}'] = require('html-loader!markdown-loader!metaless-loader!../content/${meta.filesrc}')`)
    } else if (ext === 'html') {
      requireList.push(`list['${meta.filesrc}'] = require('html-loader!metaless-loader!../content/${meta.filesrc}')`)
    }

    const page = JSON.parse(JSON.stringify(meta))
    delete page.pages
    PAGES.push(page)
    console.log('Page: /' + meta.permalink)
    
    return new HtmlWebpackPlugin(options)
  })
  
fs.writeFileSync(
  'src/theme/_pages.js',
  `const list = {}

${ requireList.join('\n') }

module.exports = list`
)

console.log('Page count:', pageFiles.length, '\n')

module.exports = {
  htmlWebpackPlugins
}
