import path from 'path';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { COMMON_CONFIG } from './config';

const CONFIG = merge(COMMON_CONFIG, {
	entry: {
		app: path.resolve(__dirname, '..', 'frontend', 'index'),
	},
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})],
	},
});

const compiler = webpack(CONFIG);

compiler.run((err, stats) => {
	if (err) {
		throw err;
	}

	console.log(
		stats.toString({
			chunks: false,
			colors: true,
		})
	);
});
