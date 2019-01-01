const componentDir = "js/component-pages";
module.exports = {
  entry: {
    "js/scripts": "./js/scripts.js"
  },
  output: {
    filename: "[name].js",
    path: __dirname + "/assets"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }]
      }
    ]
  }
};
