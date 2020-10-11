import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import http from 'http';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';
import express from 'express';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

const PORT = 3000;

const templateContent: (
	templateParameters: HtmlWebpackPlugin.TemplateParameter
) => string = ({ htmlWebpackPlugin }) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Martin</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#000000" />
		<link rel="manifest" href="/manifest.json" />
		<link href="https://fonts.googleapis.com/css2?family=Raleway&family=Work+Sans:wght@600;700&display=swap" rel="stylesheet">
		${htmlWebpackPlugin.tags.headTags.join('\n')}
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script crossorigin src="https://unpkg.com/d3@6/dist/d3.min.js"></script>
		<script crossorigin src="https://unpkg.com/react@16/umd/react.production.min.js"></script>
		<script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"></script>
		${htmlWebpackPlugin.tags.bodyTags.join('\n')}
	</body>
</html>
`;

const webpackConfig: webpack.Configuration = {
	devtool: 'source-map',
	entry: [
		path.resolve(__dirname, '..', 'frontend', 'index'),
		'webpack-hot-middleware/client',
	],
	externals: {
		d3: 'd3',
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	mode: 'development',
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
				use: 'url-loader',
			},
		],
	},
	output: {
		filename: `script.js`,
		publicPath: '/',
	},
	optimization: {
		noEmitOnErrors: true,
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin({
			multiStep: false,
		}),
		new webpack.LoaderOptionsPlugin({
			debug: true,
		}),
		new HtmlWebpackPlugin({
			inject: false,
			templateContent: templateContent as any,
		}),
		new MiniCssExtractPlugin({
			filename: `[name].[contenthash].css`,
		}),
	],
	resolve: {
		extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
		modules: [path.join(__dirname, '..', 'node_modules')],
	},
};

const compiler = webpack(webpackConfig);

const app = express();

app.use(
	express.static(path.join(path.dirname(require.resolve('react')), 'umd'))
);

app.use(
	express.static(path.join(path.dirname(require.resolve('react-dom')), 'umd'))
);

app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.use(historyApiFallback({}));

app.use(
	webpackDevMiddleware(compiler, {
		lazy: false,
		logLevel: 'error',
		publicPath: `http://localhost:${PORT}/`,
		stats: 'errors-only',
		watchOptions: {
			aggregateTimeout: 300,
			ignored: /node_modules/,
			poll: 100,
		},
	})
);

app.use(
	webpackHotMiddleware(compiler, {
		log: false,
	})
);

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
	console.log(`Listening on port ${PORT}.`);
});
