const list = {}

list['test.md'] = require('html-loader!markdown-loader!metaless-loader!../content/test.md')

module.exports = list