class Statistics {
	static SIGNIFICANCE_LEVEL = 0.05;

	constructor() {}

	static _prepareSet(set) {
		if (typeof set === 'string')
			set = set.split('');
		return set.map(item => parseInt(item));
	}

	static chiSquaredTest(set) {
		set = this._prepareSet(set);

		const n = set.length;
		const n0 = set.filter(item => item === 0).length;
		const n1 = set.filter(item => item === 1).length;
		const UNIT_PROBABILITY = .5;

		const chi2 = n * (Math.pow(n0 / n - UNIT_PROBABILITY, 2) / UNIT_PROBABILITY +
			Math.pow(n1 / n - UNIT_PROBABILITY, 2) / UNIT_PROBABILITY);
		const FREEDOM_DEGREE = 1;
		const CRITICAL_VALUE = 3.842;

		return {
			chi2: chi2,
			significanceLevel: this.SIGNIFICANCE_LEVEL,
			freedomDegree: FREEDOM_DEGREE,
			criticalValue: CRITICAL_VALUE,
			isDistributionUniform: chi2 < CRITICAL_VALUE
		}
	}

	static balanceTest(set) {
		const sets = this._prepareSet(set)
			.join('')
			.match(/.{1,100}/g)
			.map(set => set.split('').map(item => parseInt(item)))
			.map(set => {
				const n0 = set.filter(item => item === 0).length;
				const n1 = set.filter(item => item === 1).length;
				const DIFFERENCE_PERCENT = Math.abs(1 - n0 / n1);

				return {
					length: set.length,
					difference: DIFFERENCE_PERCENT,
					significanceLevel: this.SIGNIFICANCE_LEVEL,
					testSucceed: DIFFERENCE_PERCENT < this.SIGNIFICANCE_LEVEL
				}
			});
		sets.testSucceed = sets.every(set => set.testSucceed);

		return sets;
	}

	static cyclicityTest(set) {
		set = this._prepareSet(set);
		let rangeLengths = {};

		for (let i = 1, count = 1, char = set[0]; i < set.length; i++) {
			const curChar = set[i];
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
		const series = Object.keys(rangeLengths)
			.map(length => {
				const EXPECTED_PERCENT = Math.pow(.5, parseInt(length));
				const ACTUAL_PERCENT = rangeLengths[length] / TOTAL_RANGES
				return {
					expected: EXPECTED_PERCENT,
					actual: ACTUAL_PERCENT,
					testSucceed: Math.abs(1 - EXPECTED_PERCENT / ACTUAL_PERCENT) < this.SIGNIFICANCE_LEVEL
				}
			});
		series.testSucceed = Object.keys(rangeLengths).every(length => length.testSucceed);

		return series;
	}

	static correlationTest(set, shifts = 0) {
		const cyclicShift = set => [set[set.length - 1], ...set.slice(0, set.length - 1)];
		const compareSets = (setA, setB) => {
			const accordances = setA
				.map((item, index) => item === setB[index])
				.reduce((acc, cur) => acc + cur);
			const disaccordances = setA.length - accordances;
			const DIFFERENCE_PERCENT = Math.abs(1 - accordances / disaccordances);

			return {
				accordances: accordances,
				disaccordances: disaccordances,
				difference_percent: DIFFERENCE_PERCENT,
				testSucceed: DIFFERENCE_PERCENT < this.SIGNIFICANCE_LEVEL
			};
		};

		set = this._prepareSet(set);
		shifts = parseInt(shifts) || set.length - 1;

		const testResults = [];
		for (let i = 0, curSet = cyclicShift(set); i < shifts; i++) {
			testResults.push(compareSets(set, curSet));
			curSet = cyclicShift(curSet);
		}
		testResults.testSucceed = testResults.every(item => item.testSucceed);
		testResults.significanceLevel = this.SIGNIFICANCE_LEVEL;

		return testResults;
	}
}