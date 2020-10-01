export interface BandDimension {
	internalRadius: number;
	externalRadius: number;
}

export interface Band {
	color: string;
	name: string;
	generateShape(data: {
		attach: number;
		dimension: BandDimension;
		halfSpan: number;
	}): (number | string)[];
}
