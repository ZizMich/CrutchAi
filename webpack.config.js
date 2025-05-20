const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    content: './content/index.js',
    background: './background/index.js',
    popup: './popup/index.js',
    youtube: './youtube/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname),
    clean: false
  },
  resolve: {
    extensions: ['.js'],
    modules: [path.resolve(__dirname, 'content'), 'node_modules']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  chrome: "58"
                }
              }]
            ]
          }
        }
      }
    ]
  },
  experiments: {
    topLevelAwait: true
  },
  optimization: {
    minimize: false,
    splitChunks: false
  }
};
