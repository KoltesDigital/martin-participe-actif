import path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import webpack from 'webpack';

export const COMMON_CONFIG: webpack.Configuration = {
	externals: {
		d3: 'd3',
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	module: {
		rules: [
			{
				exclude: /node_modules/,
				test: /\.tsx?$/,
				use: {
					loader: 'babel-loader',
					options: {
						cacheDirectory: true,
						rootMode: 'upward',
					},
				},
			},
			{
				test: /\.(?:frag|vert)$/,
				use: 'raw-loader',
			},
			{
				test: /\.global\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			{
				test: /^((?!\.global).)*\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[name]__[local]__[hash:base64:5]',
							},
							sourceMap: true,
						},
					},
				],
			},
			// SASS support - compile all .global.scss files and pipe it to style.css
			{
				test: /\.global\.(scss|sass)$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							sourceMap: true,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			// SASS support - compile all other .scss files and pipe it to style.css
			{
				test: /^((?!\.global).)*\.(scss|sass)$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							modules: {
								localIdentName: '[name]__[local]__[hash:base64:5]',
							},
							sourceMap: true,
						},
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
						},
					},
				],
			},
			// WOFF Font
			{
				test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
					},
				},
			},
			// WOFF2 Font
			{
				test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/font-woff',
					},
				},
			},
			// TTF Font
			{
				test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'application/octet-stream',
					},
				},
			},
			// EOT Font
			{
				test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
				use: 'file-loader',
			},
			// SVG Font
			{
				test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
						mimetype: 'image/svg+xml',
					},
				},
			},
			// Common Image Formats
			{
				test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 10000,
					},
				},
			},
		],
	},
	optimization: {
		noEmitOnErrors: true,
	},
	output: {
		filename: `[name].[hash].js`,
	},
	plugins: [
		new MiniCssExtractPlugin({
			esModule: true,
			filename: `[name].[hash].css`,
		}),
	],
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
		modules: [path.join(__dirname, '..', 'node_modules')],
	},
};
