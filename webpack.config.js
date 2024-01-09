const path = require('path');

module.exports = {
  entry: {
    // content: './chrome/content.ts', //NOTE: !!edit directly in extension folder!!
    background: './chrome/background.ts',
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: { noEmit: false },
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, '../extension'),
    filename: '[name].js',
  },
};
