import { Gamma } from '@core/gamma';

export class Avalanche {
	static getDifferences(setsA: string[], setsB: string[], iterations = 16): number[] {
		const differenceBits = [];
		for (let i = 0; i < iterations + 2; i++) {
			differenceBits.push(
				Gamma.apply(setsA[i], setsB[i])
					.split('')
					.map((bit: string): number => +bit)
					.reduce((acc, cur) => acc + cur)
			);
		}

		return differenceBits;
	}

	static getCriterias(strBits: string, key: string, cipher: any, target: 'key' | 'text' = 'text') {
		const blockLength = 64;
		strBits = strBits.length % blockLength ?
			'0'.repeat(strBits.length % blockLength) + strBits :
			strBits;
		const fullLength = strBits.length;
		const N = Math.round(fullLength / blockLength); // #U
		const n = {
			key: key,
			text: strBits
		}[target].length, m = blockLength;

		const blocks = (strBits.match(/[01]{1,64}/g) || []);

		let dependencyMatrix: number[][] = [];
		let distanceMatrix: number[][] = [];

		for (let i = 0; i < n; i++) {
			let dependencyRow: number[] = [];
			let distanceRow: number[] = [];

			let A = blocks.map(block => block.split('').map(bit => +bit));
			let B = A.slice().map(block => {
				const blockCopy = block.slice();
				if (i < blockCopy.length && target === 'text') {
					blockCopy[i] = +!blockCopy[i];
				}
				return blockCopy;
			});
			const keyA = key;
			const keyB = target !== 'key' ? key :
				key.slice(0, i) + +!+key.slice(i, i + 1) + key.slice(i + 1);
			A = A.map(block => cipher(block.join(''), keyA).split('').map((bit: string) => +bit));
			B = B.map(block => cipher(block.join(''), keyB).split('').map((bit: string) => +bit));

			for (let j = 0; j < m; j++) {
				// Количество блоков, где при изменении i меняется j
				dependencyRow[j] = A
					.map((block, index) => block[j] ^ B[index][j])
					.reduce((acc, cur) => acc + cur);

				// Количество блоков, в которых число отличных бит == j
				distanceRow[j] = A.map((block, i) => block
						.map((bit, j) => bit ^ B[i][j])
						.reduce((acc, cur) => acc + cur)
					).filter(diffs => diffs === j + 1)
					.length;
			}
			dependencyMatrix[i] = dependencyRow;
			distanceMatrix[i] = distanceRow;
		}

		// Среднее число битов выхода, изменяющихся
		// при изменении одного бита входного вектора
		const averageBits = (distanceMatrix: number[][]): number => {
			return distanceMatrix
				.map((row: number[]): number => row
					.map((b, j) => (j + 1) * b)
					.reduce((acc, cur) => acc + cur)
				).reduce((acc, cur) => acc + cur) /
				(distanceMatrix.length * N);
		}

		// Степень полноты преобразования
		const conversionCompleteness = (dependencyMatrix: number[][]): number => {
			return 1 - dependencyMatrix
				.map(row => row.filter(a => a === 0).length)
				.reduce((acc, cur) => acc + cur) /
				(dependencyMatrix.length * dependencyMatrix[0].length);
		};

		// Степень лавинного эффекта
		const avalancheDegree = (distanceMatrix: number[][]): number => {
			const n = distanceMatrix.length;
			const m = distanceMatrix[0].length;

			return 1 - distanceMatrix
				.map(row => Math.abs(
					row.map((b, j) => 2 * (j + 1) * b)
						.reduce((acc, cur) => acc + cur) / N  - m
				)).reduce((acc, cur) => acc + cur) /
				(n * m);
		};

		// Степень соответствия строгому лавинному критерию
		const strictAvalancheDegree = (dependencyMatrix: number[][]): number => {
			return 1 - dependencyMatrix
			.map(row => row
				.map(a => Math.abs(2 * a / N - 1))
				.reduce((acc, cur) => acc + cur)
			)
			.reduce((acc, cur) => acc + cur) /
			(dependencyMatrix.length * dependencyMatrix[0].length);
		};

		return {
			averageBits: averageBits(distanceMatrix),
			conversionCompleteness: conversionCompleteness(dependencyMatrix),
			avalancheDegree: avalancheDegree(distanceMatrix),
			strictAvalancheDegree: strictAvalancheDegree(dependencyMatrix)
		};
	}
}
