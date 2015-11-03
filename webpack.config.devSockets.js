var path = require('path');
var webpack = require('webpack');
module.exports = {
    devtool: 'eval',
    entry: [
        './src/js/app'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'snake.js',
        publicPath: '/static/'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: path.join(__dirname, 'src')
        }, {
            test: /\.less$/,
            loader: 'style!css!less',
            include: path.join(__dirname, 'src')
        }]
    }
};