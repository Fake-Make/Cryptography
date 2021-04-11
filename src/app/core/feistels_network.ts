import { Gamma } from './gamma';

export class FeistelsNetwork {
	private key: string;
	private vfCase: number;
	private avalanche: string[] = [];

	constructor(key: string, vfCase = 3) {
		this.key = key;
		this.vfCase = vfCase % 4;
	}

	// Для i-го раунда подключом Vi является цепочка из
	// 32-х подряд идущих бит заданного ключа, которая начинается с бита
	// номер i, продолжается до последнего бита ключа и при его достижении
	// циклически повторяется, начиная с 1 бита;
	private getSubkeyA = (i: number): string => {
		let key = this.key;
		i = key.length - i;
		key = key.slice(i) + key.slice(0, i);
		return key.repeat(Math.ceil(32 / key.length)).slice(0, 32);
	};

	// Для i-го раунда, начиная с бита номер i, берётся цепочка из 8-ми
	// подряд идущих битов ключа, которая является начальным значением
	// для скремблера вида 00000011. Подключом является сгенерированная
	// этим скремблером последовательность из 32-х бит;
	private getSubkeyB = (i: number): string => {
		let key = this.key;
		i = key.length + 1 - i;
		const initState = key.slice(i - 8, i);
		const polynom = '00000011';
		return Gamma.getScramblerGamma(32, polynom, initState).gamma;
	};

	// Единичная образующая функция
	private generatingFunctionA = (Vi: string): string => Vi;

	// Функция имеет вид F(V, X) = S(X) ^ V, где S(X) – левая часть
	// шифруемого блока, на которую посредством операции XOR
	// была наложена 32-хбитная последовательность, сгенерированная 16-ти разрядным
	// скремблером вида 01000000 00000011;
	private generatingFunctionB = (Vi: string, bits32: string): string => {
		const polynom = '0100000000000011';
		const scramblerGamma: string = Gamma.getScramblerGamma(32, polynom).gamma;

		const sOfX: string = Gamma.apply(scramblerGamma, bits32);
		return Gamma.apply(Vi, sOfX);
	};

	private iterateBlocks = (blocks: string[], i: number): string[] => {
		const selectedMethods = [
			{v: this.getSubkeyA, f: this.generatingFunctionA},
			{v: this.getSubkeyA, f: this.generatingFunctionB},
			{v: this.getSubkeyB, f: this.generatingFunctionA},
			{v: this.getSubkeyB, f: this.generatingFunctionB},
		][this.vfCase % 4] || {v: this.getSubkeyB, f: this.generatingFunctionB};

		const left32: string = blocks[0];
		const right32: string = blocks[1];
		const Vi: string = selectedMethods.v(i);

		const newLeft32: string = Gamma.apply(
			selectedMethods.f(Vi, left32),
			right32
		);
		const newRight32: string = left32;

		return [
			newLeft32,
			newRight32
		];
	}

	private encryptBlock = (bits64: string, direct: boolean): string => {
		let blocks: string[] = bits64.match(/.{1,32}/g) || [];
		this.avalanche.push(bits64);

		for (let i = direct ? 1 : 16;
			direct ? i <= 16 : i >= 1;
			i += direct ? 1 : -1) {
			blocks = this.iterateBlocks(blocks, i);
			this.avalanche.push(blocks.join(''));
		}

		this.avalanche.push(blocks.reverse().join(''));
		return this.avalanche[this.avalanche.length - 1];
	}

	getAvalanche = (): string[] => this.avalanche;

	apply = (bits: string, direct = true): string => {
		this.avalanche = [];
		return (('0'.repeat(bits.length % 64 ? 64 - bits.length % 64 : 0) + bits)
			.match(/.{1,64}/g) || [])
			.map((block: string): string => this.encryptBlock(block, direct))
			.join('');
	}
}