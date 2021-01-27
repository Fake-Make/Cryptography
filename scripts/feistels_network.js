class FeistelsNetwork {
	// Для i-го раунда подключом Vi является цепочка из
	// 32-х подряд идущих бит заданного ключа, которая начинается с бита
	// номер i, продолжается до последнего бита ключа и при его достижении
	// циклически повторяется, начиная с 1 бита;
	static _getSubkeyA = (key, i) => {
		i = key.length - i;
		key = key.slice(i) + key.slice(0, i);
		return key.repeat(Math.ceil(32 / key.length)).slice(0, 32);
	};

	// Для i-го раунда, начиная с бита номер i, берётся цепочка из 8-ми
	// подряд идущих битов ключа, которая является начальным значением
	// для скремблера вида 00000011. Подключом является сгенерированная
	// этим скремблером последовательность из 32-х бит;
	static _getSubkeyB = (key, i) => {
		i = key.length - i;
		const initState = key.slice(i - 8, i);
		const polynom = '00000011';
		return Gamma.getScramblerGamma(32, polynom, initState).gamma;
	};

	// Единичная образующая функция
	static _generatingFunctionA = (key) => {
		return key;
	};

	// Функция имеет вид F(V, X) = S(X) ^ V, где S(X) – левая часть
	// шифруемого блока, на которую посредством операции XOR
	// была наложена 32-хбитная последовательность, сгенерированная 16-ти разрядным
	// скремблером вида 01000000 00000011;
	static _generatingFunctionB = (key, bits32) => {
		const polynom = '0100000000000011';
		const scramblerGamma = Gamma.getScramblerGamma(32, polynom).gamma;

		const sOfX = Gamma.apply(scramblerGamma, bits32);
		return Gamma.apply(key, sOfX);
	};

	static _iterateBlocks = (blocks, key, i, vfCase = 3) => {
		const selectedMethods = [
			{v: this._getSubkeyA, f: this._generatingFunctionA},
			{v: this._getSubkeyA, f: this._generatingFunctionB},
			{v: this._getSubkeyB, f: this._generatingFunctionA},
			{v: this._getSubkeyB, f: this._generatingFunctionB},
		][vfCase % 4] || {v: this._getSubkeyB, f: this._generatingFunctionB};

		const left32 = blocks[0];
		const right32 = blocks[1];
		const Vi = selectedMethods.v(key, i);

		const newLeft32 = Gamma.apply(
			selectedMethods.f(Vi, left32),
			right32
		);
		const newRight32 = left32;

		return [
			newLeft32,
			newRight32
		];
	}

	static _encryptBlock = (bits64, key, vfCase, direct) => {
		let blocks = bits64.match(/.{1,32}/g);

		for (let i = direct ? 1 : 16;
			direct ? i <= 16 : i >= 1;
			i += direct ? 1 : -1) {
			blocks = this._iterateBlocks(blocks, key, i, vfCase);
		}

		return blocks.reverse().join('');
	}

	static apply = (bits, key, vfCase = 3, direct = true) => {
		return ('0'.repeat(bits.length % 64 ? 64 - bits.length % 64 : 0) + bits)
			.match(/.{1,64}/g)
			.map(block => this._encryptBlock(block, key, vfCase, direct))
			.join('');
	}
}