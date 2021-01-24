class Scrambler extends Gamma {
	constructor(polynom = '10000110101', initialState = null) {
		// polynom 'x^10 + x^7 + x' must be written as
		// '10010000010'
		super();

		this.state = initialState || this._getRandomGamma(polynom.length);
		this.polynom = polynom;
		this._makeScramblerGamma();
	}

	getState() {return this.state;}
	setState(state) {this.state = state;}
	getPolynom() {return this.polynom;}
	setPolynom(polynom) {this.polynom = polynom;}

	_makeNextIter() {
		const slicedPolynom = this.polynom.slice(-this.state.length);
		let up = parseInt(this.state.slice(0, 1));
		let down = parseInt(slicedPolynom.slice(0, 1));
		let leftUnit = up & down;

		for (let i = 1; i < this.state.length; i++) {
			up = parseInt(this.state.slice(i, i + 1));
			down = parseInt(slicedPolynom.slice(i, i + 1));

			leftUnit ^= up & down;
		}

		this.state = leftUnit + this.state.slice(0, this.state.length - 1);
	}

	_makeScramblerGamma() {
		let states = [];
		while (!states.includes(this.state))
			states.push(this.state), this._makeNextIter();

		const periodStart = states.findIndex(state => state === this.state);
		const rawGamma = states
			.map(state => state.slice(-1))
			.join('');

		this.prefixPart = rawGamma.slice(0, periodStart);
		this.repeatablePart = rawGamma.slice(periodStart);
	}

	apply(str) {
		const origin = new Convertable(str);
		const originBits = origin.getBinary();
		
		const repeatitions = Math.ceil(
			(originBits.length - this.prefixPart.length) / this.repeatablePart.length
		);
		const gamma = (this.prefixPart + this.repeatablePart.repeat(repeatitions))
			.slice(0, originBits.length);

		let cipher = '';
		for (let i = 0; i < originBits.length; i++) {
			cipher += originBits.slice(i, i + 1) ^ gamma.slice(i, i + 1);
		}
		origin.setBinary(cipher);
		return origin;
	}
}