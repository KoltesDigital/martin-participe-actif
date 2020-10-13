import http from 'http';
import path from 'path';
import historyApiFallback from 'connect-history-api-fallback';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import { merge } from 'webpack-merge';
import { COMMON_CONFIG } from './config';

const PORT = 3000;

const CONFIG = merge(COMMON_CONFIG, {
	devtool: 'source-map',
	entry: {
		app: path.resolve(__dirname, '..', 'frontend', 'index'),
		whm: 'webpack-hot-middleware/client',
	},
	mode: 'development',
	plugins: [
		new webpack.HotModuleReplacementPlugin({
			multiStep: false,
		}),
		new webpack.LoaderOptionsPlugin({
			debug: true,
		}),
	],
});

const compiler = webpack(CONFIG);

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
