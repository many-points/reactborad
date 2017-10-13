const webpack = require("webpack");
//var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


const config = {
  entry:  __dirname + '/js/index.jsx',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',

  },
  resolve: {
    extensions: ['.js', '.jsx', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),

//  new BundleAnalyzerPlugin()
  ]
};

module.exports = config;
