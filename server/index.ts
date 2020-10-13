import http from 'http';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';
import express from 'express';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { merge } from 'webpack-merge';
import { COMMON_CONFIG } from './config';

const PORT = 3000;

const templateContent: (
	templateParameters: HtmlWebpackPlugin.TemplateParameter
) => string = ({ htmlWebpackPlugin }) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Participe Actif [DEV]</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#000000" />
		<link href="/fonts/all.css" rel="stylesheet">
		${htmlWebpackPlugin.tags.headTags.join('\n')}
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script crossorigin src="/d3.min.js"></script>
		<script crossorigin src="/react.production.min.js"></script>
		<script crossorigin src="/react-dom.production.min.js"></script>
		${htmlWebpackPlugin.tags.bodyTags.join('\n')}
	</body>
</html>
`;

const CONFIG = merge(COMMON_CONFIG, {
	devtool: 'source-map',
	entry: [
		path.resolve(__dirname, '..', 'frontend', 'index'),
		'webpack-hot-middleware/client',
	],
	mode: 'development',
	output: {
		publicPath: '/',
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
			templateContent: templateContent as () => string,
		}),
	],
});

const compiler = webpack(CONFIG);

const app = express();

app.use(express.static(path.dirname(require.resolve('d3'))));

app.use(
	express.static(path.join(path.dirname(require.resolve('react')), 'umd'))
);

app.use(
	express.static(path.join(path.dirname(require.resolve('react-dom')), 'umd'))
);

app.use(express.static(path.resolve(__dirname, '..', 'public')));

app.use(express.static(path.resolve(__dirname, '..', 'public.dev')));

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
