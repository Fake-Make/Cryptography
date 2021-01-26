class Gamma extends Convertable {
	constructor (chars = 1) {
		super();
		this.length = chars * 8;
		this.setGamma(this._getRandomGamma(this.length));
	}

	_getRandomGamma(length) {
		let gamma = [];

		for (let i = 0; i < length / 8; i++) {
			gamma.push(Math.round(Math.random() * 255));
		}
		return gamma;
	}

	getGamma() {return this.gamma;}

	setGamma(gamma) {
		if (typeof gamma === 'string')
			gamma = gamma
				.match(/.{1,8}/g)
				.map(byte => parseInt(byte, 2));
		this.length = gamma.length;
		this.gamma = gamma;
		this.setBinary(this.gamma
			.map(byte => {
				byte = byte.toString(2);
				return '0'.repeat(8 - byte.length) + byte;
			})
			.join('')
		);
	}

	getLength() {return this.length;}

	setLength(chars = 1) {
		this.setGamma(this._getRandomGamma(chars * 8));
	}

	apply(str) {
		const origin = new Convertable(str);
		const originBytes = origin.getBytes();
		const cipheredBytes = originBytes
			.map((byte, index) => byte ^ this.gamma[index]);
		origin.setBytes(cipheredBytes);
		return origin;
	}
}