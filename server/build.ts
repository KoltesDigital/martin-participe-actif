import path from 'path';
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

const CONFIG = merge(COMMON_CONFIG, {
	entry: {
		app: path.resolve(__dirname, '..', 'frontend', 'index'),
	},
	mode: 'production',
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin({}), new OptimizeCSSAssetsPlugin({})],
	},
	output: {
		path: path.resolve(__dirname, '..', 'dist'),
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
});
