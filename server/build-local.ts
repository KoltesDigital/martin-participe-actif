import path from 'path';
import fs from 'fs-extra';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { COMMON_CONFIG } from './config';

const templateContent: (
	templateParameters: HtmlWebpackPlugin.TemplateParameter
) => string = ({ htmlWebpackPlugin }) => `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Participe Actif</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<meta name="theme-color" content="#000000" />
		<link href="fonts/all.css" rel="stylesheet">
		${htmlWebpackPlugin.tags.headTags.join('\n')}
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="d3.min.js"></script>
		<script src="react.production.min.js"></script>
		<script src="react-dom.production.min.js"></script>
		${htmlWebpackPlugin.tags.bodyTags.join('\n')}
	</body>
</html>
`;

const DIST_PATH = path.join(__dirname, '..', 'dist');

const CONFIG = merge(COMMON_CONFIG, {
	entry: {
		app: path.join(__dirname, '..', 'frontend', 'index'),
	},
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})],
	},
	output: {
		path: DIST_PATH,
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: false,
			templateContent: templateContent as () => string,
		}),
	],
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

	const COPY_TASKS: Array<[string, string]> = [
		[
			path.resolve(require.resolve('d3'), '..', 'd3.min.js'),
			path.join(DIST_PATH, 'd3.min.js'),
		],
		[
			path.resolve(
				require.resolve('react'),
				'..',
				'umd',
				'react.production.min.js'
			),
			path.join(DIST_PATH, 'react.production.min.js'),
		],
		[
			path.resolve(
				require.resolve('react-dom'),
				'..',
				'umd',
				'react-dom.production.min.js'
			),
			path.join(DIST_PATH, 'react-dom.production.min.js'),
		],
		[
			path.resolve(__dirname, '..', 'public.dev', 'fonts'),
			path.join(DIST_PATH, 'fonts'),
		],
	];

	COPY_TASKS.forEach((copyTask) => {
		fs.copySync(copyTask[0], copyTask[1]);
	});
});
