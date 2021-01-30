export class Gamma {
	static getSimpleGamma(length = 8): string {
		const bytesLength = Math.round(length / 8);
		let gamma = '';

		for (let i = 0; i < bytesLength; i++) {
			const byte = Math.round(Math.random() * 255).toString(2);
			gamma += '0'.repeat(8 - byte.length) + byte;
		}

		return gamma;
	}

	static getScramblerGamma(length = 8,
		polynom = '10000110101',
		state = '1001111'
	): {gamma: string, period: number} {
		// Prepare scrambler
		const _makeNextIter = (): void => {
			const slicedPolynom: string = polynom.slice(-state.length);
			let up: number = parseInt(state.slice(0, 1));
			let down: number = parseInt(slicedPolynom.slice(0, 1));
			let leftUnit: number = up & down;

			for (let i = 1; i < state.length; i++) {
				up = parseInt(state.slice(i, i + 1));
				down = parseInt(slicedPolynom.slice(i, i + 1));

				leftUnit ^= up & down;
			}

			state = leftUnit + state.slice(0, state.length - 1);
		};

		const states: string[] = [];
		while (!states.includes(state))
			states.push(state), _makeNextIter();

		const periodStart = states.findIndex(iterState => iterState === state);
		const rawGamma = states
			.map((state: string) => state.slice(-1))
			.join('');

		const prefixPart: string = rawGamma.slice(0, periodStart);
		const repeatablePart: string = rawGamma.slice(periodStart);
		const period: number = repeatablePart.length;

		// Generate gamma
		const repeatitions: number = Math.ceil((length - prefixPart.length) / period);
		return {
			gamma: (prefixPart + repeatablePart.repeat(repeatitions)).slice(0, length),
			period: period
		};
	}

	static apply(gamma: string, strBits: string): string {
		const missingZeroes = '0'.repeat(Math.abs(gamma.length - strBits.length));
		if (missingZeroes) {
			gamma.length < strBits.length ?
				gamma = missingZeroes + gamma :
				strBits = missingZeroes + strBits;
		}

		let cipher = '';
		for (let i = 0; i < strBits.length; i++) {
			cipher += +strBits.slice(i, i + 1) ^
				+gamma.slice(i, i + 1);
		}

		return cipher;
	}
}