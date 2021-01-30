type Set = string | string[] | number[];

export class Statistics {
	static SIGNIFICANCE_LEVEL = .05;

	static _prepareSet(set: Set): number[] {
		set = typeof set === 'string' ? set.split('') : set.join('').split('');
		return set.map((item: string): number => +item);
	}

	static chiSquaredTest(set: Set) {
		set = this._prepareSet(set);

		const n: number = set.length;
		const n0: number = set.filter(item => item === 0).length;
		const n1: number = set.filter(item => item === 1).length;
		const UNIT_PROBABILITY = .5;

		const chi2: number = n * (Math.pow(n0 / n - UNIT_PROBABILITY, 2) / UNIT_PROBABILITY +
			Math.pow(n1 / n - UNIT_PROBABILITY, 2) / UNIT_PROBABILITY);
		const FREEDOM_DEGREE = 1;
		const CRITICAL_VALUE = 3.842;

		return {
			chi2: chi2,
			significanceLevel: this.SIGNIFICANCE_LEVEL,
			freedomDegree: FREEDOM_DEGREE,
			criticalValue: CRITICAL_VALUE,
			isDistributionUniform: chi2 < CRITICAL_VALUE
		};
	}

	static balanceTest(set: Set) {
		const sets: any = (this._prepareSet(set)
			.join('')
			.match(/.{1,100}/g) || [])
			.map((set: string): number[] =>
				set.split('').map((item: string): number => parseInt(item)))
			.map((set: number[]) => {
				const n0: number = set.filter(item => item === 0).length;
				const n1: number = set.filter(item => item === 1).length;
				const DIFFERENCE_PERCENT: number = Math.abs(1 - n0 / n1);

				return {
					length: set.length,
					difference: DIFFERENCE_PERCENT,
					significanceLevel: this.SIGNIFICANCE_LEVEL,
					testSucceed: DIFFERENCE_PERCENT < this.SIGNIFICANCE_LEVEL
				}
			});
		sets.testSucceed = sets.every((set: {testSucceed: boolean}): boolean => set.testSucceed);

		return sets;
	}

	static cyclicityTest(set: Set) {
		set = this._prepareSet(set);
		let rangeLengths: any = {};

		for (let i = 1, count = 1, char: number = set[0]; i < set.length; i++) {
			const curChar: number = set[i];
			if (char === curChar) {
				count++;
			} else {
				rangeLengths[count] = rangeLengths[count] ?
					rangeLengths[count] + 1 : 1;
				count = 1;
				char = curChar;
			}
		}

		const TOTAL_RANGES = Object.keys(rangeLengths)
			.map(length => rangeLengths[length])
			.reduce((acc, cur) => acc + cur);
		const series: any = Object.keys(rangeLengths)
			.map(length => {
				const EXPECTED_PERCENT = Math.pow(.5, parseInt(length));
				const ACTUAL_PERCENT = rangeLengths[length] / TOTAL_RANGES;
				return {
					expected: EXPECTED_PERCENT,
					actual: ACTUAL_PERCENT,
					testSucceed: Math.abs(EXPECTED_PERCENT - ACTUAL_PERCENT) < this.SIGNIFICANCE_LEVEL
				}
			});
		series.testSucceed = Object.keys(rangeLengths).every((length: string): boolean => rangeLengths[length].testSucceed);

		return series;
	}

	static correlationTest(set: Set, shifts = 0) {
		const cyclicShift = (set: number[]): number[] => [set[set.length - 1], ...set.slice(0, set.length - 1)];
		const compareSets = (setA: number[], setB: number[]) => {
			const accordances: number = setA
				.map((item: number, index): number => +(item === setB[index]))
				.reduce((acc, cur): number => acc + cur);
			const disaccordances: number = setA.length - accordances;
			const DIFFERENCE_PERCENT: number = Math.abs(1 - accordances / disaccordances);

			return {
				accordances: accordances,
				disaccordances: disaccordances,
				difference_percent: DIFFERENCE_PERCENT,
				testSucceed: DIFFERENCE_PERCENT < this.SIGNIFICANCE_LEVEL
			};
		};

		set = this._prepareSet(set);
		shifts = +shifts || set.length - 1;

		const testResults: any = [];
		for (let i = 0, curSet: number[] = cyclicShift(set); i < shifts; i++) {
			testResults.push(compareSets(set, curSet));
			curSet = cyclicShift(curSet);
		}
		testResults.testSucceed = testResults.every(
			(item: {testSucceed: boolean}): boolean => item.testSucceed);
		testResults.significanceLevel = this.SIGNIFICANCE_LEVEL;

		return testResults;
	}
}