import * as d3 from 'd3';
import { Band } from './types';

export const BAND_INFOS: Band[] = [
	{
		color: '#00ca81',
		name: 'Très favorable',
		generateShape({ attach, dimension, halfSpan }) {
			return [
				'M',
				attach,
				-halfSpan,
				'L',
				dimension.externalRadius - halfSpan,
				-halfSpan,
				'A',
				halfSpan,
				halfSpan,
				0,
				0,
				1,
				dimension.externalRadius - halfSpan,
				halfSpan,
				'L',
				attach,
				halfSpan,
			];
		},
	},
	{
		color: '#00ffc2',
		name: 'Favorable',
		generateShape({ attach, dimension, halfSpan }) {
			const control = (attach + dimension.externalRadius - halfSpan) / 2;

			return [
				'M',
				attach,
				-halfSpan,
				'C',
				control,
				-halfSpan,
				dimension.externalRadius,
				-halfSpan / 2,
				dimension.externalRadius,
				0,
				'S',
				control,
				halfSpan,
				attach,
				halfSpan,
			];
		},
	},
	{
		color: '#0031f0',
		name: 'Neutre',
		generateShape({ attach, dimension, halfSpan }) {
			return [
				'M',
				attach,
				-halfSpan,
				'L',
				dimension.externalRadius,
				0,
				'L',
				attach,
				halfSpan,
			];
		},
	},
	{
		color: '#ff8564',
		name: 'Défavorable',
		generateShape({ attach, dimension, halfSpan }) {
			const control =
				attach * 0.1 + (dimension.externalRadius - halfSpan) * 0.9;
			const controlTangent = halfSpan / 2;

			return [
				'M',
				attach,
				-halfSpan,
				'C',
				attach + (controlTangent * halfSpan) / attach,
				-controlTangent,
				control,
				-halfSpan / 4,
				dimension.externalRadius,
				0,
				'C',
				control,
				halfSpan / 4,
				attach + (controlTangent * halfSpan) / attach,
				controlTangent,
				attach,
				halfSpan,
			];
		},
	},
	{
		color: '#ff2a1f',
		name: 'Très défavorable',
		generateShape({ attach, dimension, halfSpan }) {
			const top =
				dimension.internalRadius +
				Math.min(
					halfSpan,
					(dimension.externalRadius - dimension.internalRadius) / 2
				);
			const control = attach * 0.5 + top * 0.5;
			const controlTangent = halfSpan / 2;
			const strokeWidth = 1;

			return [
				'M',
				attach,
				-halfSpan,
				'C',
				attach + (controlTangent * halfSpan) / attach,
				-controlTangent,
				control,
				-strokeWidth,
				top,
				-strokeWidth,
				'L',
				dimension.externalRadius,
				-strokeWidth,
				'L',
				dimension.externalRadius,
				strokeWidth,
				'L',
				top,
				strokeWidth,
				'C',
				control,
				strokeWidth,
				attach + (controlTangent * halfSpan) / attach,
				controlTangent,
				attach,
				halfSpan,
			];
		},
	},
];

export const BAND_MARGIN = 10;
export const SMALLEST_BAND_RADIUS = 5;
export const SMALLEST_BAND_HEIGHT = 10;
export const BAND_HEIGHT_GROW_FACTOR = 1.7;

export const PETAL_MAX_ANGLE_SPAN = Math.PI / 4;

export const RANDOM_VOTES_INTERVAL = 5000;
export const RANDOM_VOTES_MIN = 5;
export const RANDOM_VOTES_MAX = 20;
export const RANDOM_VOTES_OPACITY = 0.5;

export const TRANSITION_DURATION = 300;
export const TRANSITION_EASING = d3.easeQuadInOut;

export const VIEWBOX_MARGIN = 80;
