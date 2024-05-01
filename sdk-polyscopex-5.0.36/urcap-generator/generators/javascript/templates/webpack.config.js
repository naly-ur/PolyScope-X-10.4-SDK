const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    name: 'main',
    entry: './src/index.js',
    mode: 'production',
    devServer: {
      host: '0.0.0.0',
      hot: true,
      static: ['assets'],
      allowedHosts: 'all',
      compress: true,
      port: 4200,
    },
    output: {
        path: path.resolve(__dirname, 'dist/<%= urcapId %>'),
        filename: 'main.js'
    }<% if (hasProgramNode || hasApplicationNode) { %>,
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: "./src/contribution.json" },
          { from: "./src/assets", to: path.resolve(__dirname, 'dist/<%= urcapId %>/assets') }
        ],
      }),
    ], <% } %>
  }<% if (hasApplicationNode) { %>,
  {
    name: '<%= applicationNodeName %>',
    entry: './src/application/<%= applicationNodeName %>.behavior.worker.js',
    mode: 'production',
    output: {
        path: path.resolve(__dirname, 'dist/<%= urcapId %>'),
        filename: '<%= applicationNodeName %>.worker.js'
    },
    optimization: {
      minimize: true,
        minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      })]
    }
  }<% } if (hasProgramNode) { %>,
  {
    name: '<%= programNodeName %>',
    entry: './src/program/<%= programNodeName %>.behavior.worker.js',
      mode: 'production',
      output: {
      path: path.resolve(__dirname, 'dist/<%= urcapId %>'),
        filename: '<%= programNodeName %>.worker.js'
    },
    optimization: {
      minimize: true,
        minimizer: [new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      })]
    }
  }<% } %>
];
