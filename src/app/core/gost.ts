import { DES } from '@core/des';
import { Gamma } from './gamma';

export class GOST extends DES {
	constructor(key256: string) {
		super(key256);
	}

	protected prepareSubkeys(): void {
		const rawSubkeys = this.key	// 256 bits (8x32)
			.match(/[01]{1,32}/g) || [];

		const KEY_PERMUTATION_TABLE = [
			'1', '2', '3', '4', '5', '6', '7', '8',
			'1', '2', '3', '4', '5', '6', '7', '8',
			'1', '2', '3', '4', '5', '6', '7', '8',
			'8', '7', '6', '5', '4', '3', '2', '1'
		];

		this.subkeys = KEY_PERMUTATION_TABLE
			.map(permute => rawSubkeys[+permute - 1]);
	}

	protected generationFunction(rBits: string, subkey: string): string {
		const mod2_32 = Gamma.apply(rBits, subkey);
		const bits4x8: string[] = mod2_32.match(/[01]{1,4}/g) || [];	// 4x8

		const S_4_TO_4_TABLES = [
			['4', '10', '9', '2', '13', '8', '0', '14', '6', '11', '1', '12', '7', '15', '5', '3'],
			['14', '11', '4', '12', '6', '13', '15', '10', '2', '3', '8', '1', '0', '7', '5', '9'],
			['5', '8', '1', '13', '10', '3', '4', '2', '14', '15', '12', '7', '6', '0', '9', '11'],
			['7', '13', '10', '1', '0', '8', '9', '15', '14', '4', '6', '12', '11', '2', '5', '3'],
			['6', '12', '7', '1', '5', '15', '13', '8', '4', '10', '9', '14', '0', '3', '11', '2'],
			['4', '11', '10', '0', '7', '2', '1', '13', '3', '6', '8', '5', '9', '12', '15', '14'],
			['13', '11', '4', '1', '3', '15', '5', '9', '0', '10', '14', '7', '6', '8', '2', '12'],
			['1', '15', '13', '0', '5', '7', '10', '4', '9', '2', '3', '14', '6', '11', '8', '12']
		];

		const S: string[] = bits4x8
			.map((bits4: string, sIndex: number): string => {
				const column = parseInt(bits4, 2);

				const reducedRes = (+S_4_TO_4_TABLES[sIndex][column]).toString(2);
				return '0'.repeat(4 - reducedRes.length) + reducedRes;
			});

		const cycleShift = (str: string, shift: number): string =>
			str.slice(shift) + str.slice(0, shift);

		return cycleShift(S.join(''), 11);
	}

	protected encryptBlock(bits64: string, direct: boolean): string {
		this.avalanche[0] = this.avalanche[0] ? this.avalanche[0] + bits64 : bits64;
		let blocks: string[] = bits64.match(/.{1,32}/g) || [];

		for (let i = direct ? 1 : 32;
			direct ? i <= 32 : i >= 1;
			i += direct ? 1 : -1) {
			blocks = this.iterateBlocks(blocks, i - 1);
			this.avalanche[i] = this.avalanche[i] ?
				this.avalanche[i] + blocks.join('') :
				blocks.join('');
		}

		const resCipher = blocks.reverse().join('');

		this.avalanche[33] = this.avalanche[33] ?
			this.avalanche[33] + resCipher :
			resCipher;
		return resCipher;
	}
}
