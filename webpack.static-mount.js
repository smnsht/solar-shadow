const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	mode: 'development',
	entry: './src/static-mount.js',		
	watch: true,
	plugins: [
		new HtmlWebpackPlugin({
			title: 'Static Mount',
			template: './src/html/static-mount.html',
			filename: 'static-mount.html'
		  }),
	],
	output: {
		filename: 'static-mount.js',
		path: path.resolve(__dirname, 'dist'),		
	},		
	devServer: {
		static: './dist',		
		hot: true
	}	
};