import React from 'react';
import { Context } from '../context';
import * as d3 from 'd3';
import {
	BANDS,
	BAND_HEIGHT_GROW_FACTOR,
	BAND_MARGIN,
	PETAL_MAX_ANGLE_SPAN,
	SMALLEST_BAND_HEIGHT,
	SMALLEST_BAND_RADIUS,
	VIEWBOX_MARGIN,
} from './constants';
import { Band, BandDimension } from './types';

let bandRadius = SMALLEST_BAND_RADIUS;
let bandHeight = SMALLEST_BAND_HEIGHT;
const BAND_DIMENSIONS = Array.from({ length: BANDS.length }).map(() => {
	const bandDimension: BandDimension = {
		internalRadius: bandRadius,
		externalRadius: bandRadius + bandHeight,
	};
	bandRadius += bandHeight + BAND_MARGIN;
	bandHeight *= BAND_HEIGHT_GROW_FACTOR;
	return bandDimension;
});
const VIEWBOX_SPAN = bandRadius + VIEWBOX_MARGIN;

interface GroupDatum {
	band: Band;
	circle: d3.Selection<SVGCircleElement, unknown, SVGSVGElement, unknown>;
	vote: number;
	voteIndex: number;
}

interface PetalDatum {
	petalIndex: number;
}

interface Props {
	votes: number[];
}

export class Visualization extends React.Component<
	Props & React.ComponentProps<'svg'>
> {
	static contextType = Context;

	readonly context!: Context;
	private readonly svgRef: React.RefObject<SVGSVGElement>;

	private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;

	private votes: number[];
	private randomVotesIntervalId: NodeJS.Timeout | undefined;

	constructor(props: Props) {
		super(props);

		if (props.votes.length !== BANDS.length) {
			throw new Error(`Votes should have ${BANDS.length} elements.`);
		}

		this.svgRef = React.createRef();

		this.votes = props.votes;
	}

	componentDidMount() {
		if (!this.svgRef.current) {
			throw new Error('SVG element should be available');
		}

		this.svg = d3
			.select(this.svgRef.current)
			.attr(
				'viewBox',
				[-VIEWBOX_SPAN, -VIEWBOX_SPAN, 2 * VIEWBOX_SPAN, 2 * VIEWBOX_SPAN].join(
					' '
				)
			);

		this.updateSVG();
	}

	componentDidUpdate() {
		this.updateSVG();
	}

	render() {
		return <svg ref={this.svgRef} {...this.props} />;
	}

	private updateSVG() {
		const areAllVotesZeros = this.props.votes.every((vote) => vote === 0);
		if (areAllVotesZeros) {
			if (typeof this.randomVotesIntervalId === 'undefined') {
				this.votes = this.props.votes;
				this.randomVotesIntervalId = setInterval(() => {
					this.votes = BANDS.map(() => Math.round(Math.random() * 20));
					this.updateSVG();
				}, 5000);
			}
		} else {
			if (typeof this.randomVotesIntervalId !== 'undefined') {
				clearInterval(this.randomVotesIntervalId);
				this.randomVotesIntervalId = undefined;
			}
			this.votes = this.props.votes;
		}

		const t = d3.transition().duration(300).ease(d3.easeLinear) as any;

		this.svg
			.selectAll<SVGGElement, GroupDatum>('g.band')
			.data(
				this.votes.map((vote, voteIndex) => ({
					band: BANDS[voteIndex],
					vote,
					voteIndex,
				})),
				(d) => d.voteIndex
			)
			.join((enter) =>
				enter
					.append('g')
					.attr('class', 'band')
					.call((group) => {
						group.append('circle').attr('class', 'circle');
						group.append('g').attr('class', 'petals');
					})
			)
			.sort((a, b) => b.vote - a.vote)
			.order()
			.datum((datum, sortIndex) => {
				const { band, vote } = datum;
				const dimension = BAND_DIMENSIONS[BANDS.length - 1 - sortIndex];

				const angleSpan = Math.min(PETAL_MAX_ANGLE_SPAN, Math.PI / vote);
				const halfSpan = Math.sin(angleSpan) * dimension.internalRadius;

				const attach = Math.sqrt(
					dimension.internalRadius * dimension.internalRadius -
						halfSpan * halfSpan
				);

				const d = band
					.generateShape({
						attach,
						dimension,
						halfSpan,
					})
					.join(' ');

				const petals = Array.from({ length: vote }, (_, petalIndex) => {
					let angle = (-(petalIndex + 1) / vote) * 360;
					if (vote == 2 && petalIndex == 0) {
						angle -= 1e-3;
					}
					const transform = `rotate(${angle - 90})`;

					return {
						d,
						petalIndex,
						transform,
					};
				});

				return {
					...datum,
					dimension,
					petals,
				};
			})
			.call((group) => {
				group.attr('fill', ({ band }) => band.color);

				group
					.select('.circle')
					.transition(t)
					.attr('r', ({ dimension }) => dimension.internalRadius);

				group
					.select('.petals')
					.selectAll<SVGPathElement, PetalDatum>('path')
					.data(
						({ petals }) => petals,
						(d) => d.petalIndex
					)
					.join(
						(enter) => enter.append('path').attr('transform', 'rotate(-90)'),
						undefined,
						(exit) => exit.call((e) => e.transition(t).remove())
					)
					.transition(t)
					.attr('d', ({ d }) => d)
					.attr('transform', ({ transform }) => transform);
			});
	}
}
