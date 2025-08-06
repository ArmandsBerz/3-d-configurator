const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 1. Mode: 'development' for development features, 'production' for optimized builds.
  mode: 'development',

  // 2. Entry: The starting point of our application.
  entry: './src/index.js',

  // 3. Output: Where to put the final bundled code.
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true, // Cleans the dist folder before each build
  },

  // 4. Module: Rules for how to handle different file types.
  module: {
    rules: [
      // Rule for JavaScript and JSX files using Babel
      {
        test: /\.jsx?$/, // Matches .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      // Rule for CSS and SCSS files
      {
        test: /\.s?css$/, // Matches .css and .scss files
        use: [
          'style-loader', // 3. Injects styles into the DOM
          'css-loader',   // 2. Turns css into commonjs
          'sass-loader',  // 1. Turns sass into css
        ],
      },
    ],
  },

  // 5. Plugins: Additional tools to enhance the build process.
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Uses this file as a template
    }),
  ],

  // 6. Dev Server: Configuration for the local development server.
  devServer: {
    port: 3000,         // Runs on port 3000
    open: true,         // Opens the browser automatically
    hot: true,          // Enables Hot Module Replacement
    static: {
        directory: path.join(__dirname, 'public'), // Serves files from the public directory
    },
  },
};