const baseConfig = require('./webpack.base.config')
const { resolve } = require('path')
const { merge } = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const rootPath = resolve(__dirname, '../')

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    index: resolve(rootPath, 'example/index.js')
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve(rootPath, 'example/index.html')
    }),
    new CleanWebpackPlugin()
  ]
})
