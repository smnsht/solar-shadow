const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	mode: 'development',
	entry: './src/index.js',		
	plugins: [
		new HtmlWebpackPlugin({
		  title: 'Output Management',
		  template: './src/html/index.html',
		}),
		new HtmlWebpackPlugin({
			title: 'foo',			
			template: './src/html/foo.html',			
			filename: 'foo.html'
		}),
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		clean: true
	},		
	devServer: {
		static: './dist',		
		hot: true
	},
	optimization: {
		runtimeChunk: 'single',
	},	
};