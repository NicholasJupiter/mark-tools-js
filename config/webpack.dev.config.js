const baseConfig = require('./webpack.base.config')
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { merge } = require('webpack-merge')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const rootPath = resolve(__dirname, '../')

module.exports = merge(baseConfig, {
  mode: 'development',
  entry: {
    index: resolve(rootPath, 'example/index.js')
  },
  output: {
    filename: '[name].min.js',
    path: resolve(rootPath, 'dist-demo')
  },

  devServer: {
    static: {
      directory: resolve(rootPath, 'dist-demo')
    },
    compress: true,
    port: 2000
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve(rootPath, 'example/index.html')
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(rootPath, './example/assets/'),
          to: resolve(rootPath, './assets/dist/')
        }
      ]
    }),
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        resolve(rootPath, 'dist-demo/*'),
        resolve(rootPath, 'dist/*')
      ],
      dangerouslyAllowCleanPatternsOutsideProject: true
    })
  ]
})
