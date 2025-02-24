const path = require("path");
var { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

var common;
if (process.env.NODE_ENV != "production") {
    common = require("../../webpack.config.js");
} else {
    common = require("../../webpack.production.config.js");
}

module.exports = merge(common, {
    target: 'web',
    entry: "./src/index.ts",
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        port: 8082,
        sockPort: 443 // needed because the dev server runs behind a reverse proxy (Caddy)
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            //base: "/"
        })
    ],
});
