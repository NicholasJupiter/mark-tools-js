const baseConfig = require('./webpack.base.config')
const { resolve } = require('path')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const rootPath = resolve(__dirname, '../')

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: {
    index: resolve(rootPath, 'src/index.ts')
  },
  plugins: [
    new CleanWebpackPlugin()
  ]
})
