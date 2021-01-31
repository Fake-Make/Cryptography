import { Gamma } from '@core/gamma';

export class Avalanche {
	private static FEISTEL_ITERATIONS = 16;

	static getPlot(setsA: string[], setsB: string[]): any {
		const differenceBits = [];
		for (let i = 0; i < this.FEISTEL_ITERATIONS + 2; i++) {
			differenceBits.push(
				Gamma.apply(setsA[i], setsB[i])
					.split('')
					.map((bit: string): number => +bit)
					.reduce((acc, cur) => acc + cur)
			);
		}

		return {
			x: Object.keys(differenceBits).map(str => +str),
			y: differenceBits
		};
	}
}