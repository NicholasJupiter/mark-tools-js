const webpack = require('webpack')
const { resolve } = require('path')
const rootPath = resolve(__dirname, '../')

module.exports = {
  output: {
    filename: '[name].min.js',
    path: resolve(rootPath, 'dist'),
    chunkFilename: '[id].js',
    library: {
      name: 'segmentMarkTool',
      type: 'umd'
    },
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /.(less|css)$/i,
        use: ['style-loader', 'css-loader', 'less-loader'],
        exclude: /node-modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'file-loader',
        exclude: /node-modules/
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin()

  ]
}
