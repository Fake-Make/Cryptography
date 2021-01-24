class Gamma extends Convertable {
	constructor (chars = 1) {
		super();
		this.length = chars * 8;
		this.setGamma(this._getRandomGamma(this.length));
	}

	_getRandomGamma(length) {
		let gamma = [];

		for (let i = 0; i < length / 8; i++) {
			gamma.push(Math.round(Math.random() * 256));
		}

		return gamma;
	}

	getGamma() {return this.gamma;}

	setGamma(gamma) {
		this.length = gamma.length;
		this.gamma = gamma;
		this.setBinary(this.gamma
			.map(byte => byte.toString(2))
			.join('')
		);
	}

	getLength() {return this.length;}

	setLength(length) {
		this.setGamma(this._getRandomGamma(length));
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