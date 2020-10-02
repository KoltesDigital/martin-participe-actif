import { v4 as uuidV4 } from 'uuid';
import React from 'react';
import { Context } from '../context';
import * as d3 from 'd3';
import {
	BAND_INFOS,
	BAND_HEIGHT_GROW_FACTOR,
	BAND_MARGIN,
	PETAL_MAX_ANGLE_SPAN,
	SMALLEST_BAND_HEIGHT,
	SMALLEST_BAND_RADIUS,
	VIEWBOX_MARGIN,
	COSMETIC_SHUFFLE_VOTES_INTERVAL,
	TRANSITION_DURATION,
	TRANSITION_EASING,
} from './constants';
import { BandDimension } from './types';

let bandRadius = SMALLEST_BAND_RADIUS;
let bandHeight = SMALLEST_BAND_HEIGHT;
const BAND_DIMENSIONS = Array.from({ length: BAND_INFOS.length }).map(() => {
	const bandDimension: BandDimension = {
		internalRadius: bandRadius,
		externalRadius: bandRadius + bandHeight,
	};
	bandRadius += bandHeight + BAND_MARGIN;
	bandHeight *= BAND_HEIGHT_GROW_FACTOR;
	return bandDimension;
});
const VIEWBOX_SPAN = bandRadius + VIEWBOX_MARGIN;

let leftNotRight = false;

class BandDatum {
	readonly index: number;
	readonly uuid: string;

	private _d = '';
	private _dimension!: BandDimension;
	private _displayedVote = 0;
	private _petals: PetalDatum[] = [];
	private _previousD = '';
	private _previousDisplayedVote = 0;
	private _sortIndex = 0;

	constructor(index: number) {
		this.index = index;
		this.uuid = uuidV4();
	}

	get d() {
		return this._d;
	}

	get dimension() {
		return this._dimension;
	}

	get displayedVote() {
		return this._displayedVote;
	}

	set displayedVote(displayedVote: number) {
		this._previousDisplayedVote = this._displayedVote;
		this._displayedVote = displayedVote;

		if (displayedVote === 0) {
			this._petals = [];
		}

		const getVote = () => this._displayedVote;

		while (this._petals.length > this._displayedVote) {
			if (leftNotRight) {
				this._petals.splice(1, 1);
			} else {
				this._petals.pop();
			}
			leftNotRight = !leftNotRight;
		}

		while (this._petals.length < this._displayedVote) {
			const petal: PetalDatum = {
				band: this,
				uuid: uuidV4(),
				index: 0,
				get transform() {
					const vote = getVote();
					const angle = vote === 0 ? -90 : (this.index / vote) * 360 - 90;
					return `rotate(${angle})`;
				},
			};

			if (leftNotRight) {
				this._petals.splice(1, 0, petal);
			} else {
				this._petals.push(petal);
			}
			leftNotRight = !leftNotRight;
		}

		this._petals.forEach((petal, index) => {
			petal.index = index;
		});
	}

	get petals() {
		return this._petals;
	}

	get previousD() {
		return this._previousD;
	}

	get previousDisplayedVote() {
		return this._previousDisplayedVote;
	}

	get sortIndex() {
		return this._sortIndex;
	}

	set sortIndex(sortIndex: number) {
		this._sortIndex = sortIndex;

		const dimension = BAND_DIMENSIONS[BAND_INFOS.length - 1 - sortIndex];
		this._dimension = dimension;

		const angleSpan = Math.min(
			PETAL_MAX_ANGLE_SPAN,
			Math.PI / this._displayedVote
		);
		const halfSpan = Math.sin(angleSpan) * dimension.internalRadius;

		const attach = Math.sqrt(
			dimension.internalRadius * dimension.internalRadius - halfSpan * halfSpan
		);

		this._previousD = this._d;
		this._d = BAND_INFOS[this.index]
			.generateShape({
				attach,
				dimension,
				halfSpan,
			})
			.join(' ');
	}
}

interface PetalDatum {
	band: BandDatum;
	index: number;
	transform: string;
	uuid: string;
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

	private bands: BandDatum[];
	private randomVotesIntervalId: NodeJS.Timeout | undefined;

	constructor(props: Props) {
		super(props);

		if (props.votes.length !== BAND_INFOS.length) {
			throw new Error(`Votes should have ${BAND_INFOS.length} elements.`);
		}

		this.svgRef = React.createRef();

		this.bands = BAND_INFOS.map((_, index) => new BandDatum(index));
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
		const { votes } = this.props;

		const copyVotes = () =>
			this.bands.forEach((band, i) => {
				band.displayedVote = votes[i];
			});

		const areAllVotesZeros = votes.every((vote) => vote === 0);
		if (areAllVotesZeros) {
			if (typeof this.randomVotesIntervalId === 'undefined') {
				this.randomVotesIntervalId = setInterval(() => {
					this.bands.forEach((band) => {
						band.displayedVote = Math.round(Math.random() * 20);
					});
					this.updateSVG();
				}, COSMETIC_SHUFFLE_VOTES_INTERVAL);

				copyVotes();
			}
		} else {
			if (typeof this.randomVotesIntervalId !== 'undefined') {
				clearInterval(this.randomVotesIntervalId);
				this.randomVotesIntervalId = undefined;
			}

			copyVotes();
		}

		this.svg
			.selectAll<SVGGElement, BandDatum>('g.band')
			.data(this.bands, ({ uuid }) => uuid)
			.join((enter) =>
				enter
					.append('g')
					.attr('class', 'band')
					.call((group) => {
						group.append('circle').attr('class', 'circle');
						group.append('g').attr('class', 'petals');
					})
			)
			.sort((a, b) => {
				const compareVotes = b.displayedVote - a.displayedVote;
				if (compareVotes) {
					return compareVotes;
				}

				return a.sortIndex - b.sortIndex;
			})
			.order()
			.datum((datum, sortIndex) => {
				datum.sortIndex = sortIndex;
				return datum;
			})
			.call((group) => {
				group.attr('fill', ({ index }) => BAND_INFOS[index].color);

				group
					.select('.circle')
					.transition()
					.duration(TRANSITION_DURATION)
					.ease(TRANSITION_EASING)
					.attr('r', ({ dimension }) => dimension.internalRadius);

				group
					.select('.petals')
					.selectAll<SVGPathElement, PetalDatum>('path')
					.data(
						({ petals }) => petals,
						({ uuid }) => uuid
					)
					.join(
						(enter) =>
							enter
								.append('path')
								.attr('d', ({ band }) => band.previousD)
								.attr('transform', ({ band }) =>
									band.previousDisplayedVote === 0
										? 'rotate(-90) scale(1,0)'
										: 'rotate(-90)'
								),
						undefined,
						(exit) =>
							exit.call((petal) => {
								petal
									.transition()
									.duration(TRANSITION_DURATION)
									.ease(TRANSITION_EASING)
									.attr('d', ({ band }) => band.d)
									.attr('transform', ({ band }) =>
										band.petals.length === 0
											? 'rotate(-90) scale(1,0)'
											: 'rotate(-90)'
									)
									.remove();
							})
					)
					.transition()
					.duration(TRANSITION_DURATION)
					.ease(TRANSITION_EASING)
					.attr('d', ({ band }) => band.d)
					.attr('transform', ({ transform }) => transform);
			});
	}
}
