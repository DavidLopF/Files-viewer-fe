const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const DEFAULT_API_BASE_URL = 'http://localhost:3000'

module.exports = (env = {}) => {
  const isProduction = env.production === true

  return {
    mode: isProduction ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/index.jsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? 'js/[name].[contenthash].js' : 'js/bundle.js',
      publicPath: '/',
      clean: true
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    resolve: {
      extensions: ['.js', '.jsx']
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {
          test: /\.css$/,
          use: [require.resolve('style-loader'), require.resolve('css-loader')]
        }
      ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html')
      }),
      new webpack.DefinePlugin({
        'process.env.API_BASE_URL': JSON.stringify(process.env.API_BASE_URL || DEFAULT_API_BASE_URL)
      })
    ],
    optimization: isProduction
      ? {
          splitChunks: {
            chunks: 'all'
          }
        }
      : undefined,
    devServer: {
      port: 8080,
      historyApiFallback: true,
      static: path.resolve(__dirname, 'public'),
      hot: true
    }
  }
}
