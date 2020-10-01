module.exports = (api) => {
	api.cache(true);

	return {
		ignore: ['node_modules'],

		plugins: [
			[
				'transform-class-properties',
				{
					spec: true,
				},
			],
		],

		presets: [
			[
				'@babel/preset-env',
				{
					targets: {
						browsers: 'Last 2 Chrome versions, Firefox ESR',
						node: '8.9',
					},
				},
			],
			'@babel/preset-typescript',
			'@babel/preset-react',
		],
	};
};
