class Convertable {
	constructor(entity) {
		if (typeof entity === 'string') {
			this.setString(entity);
		} else if (typeof entity === 'number') {
			this.setBinary(entity.toString(2));
		}
	}

	_strToBytes(str) {
		let bytes = [];
		for (let i = 0;
			i < str.length;
			bytes.push(str.charCodeAt(i++))
		);

		return bytes;
	}

	_bytesToBin(bytes, base = 2) {
		return bytes
			.map(byte => {
				const size = base === 2 ? 8 : 2;
				byte = byte.toString(base);
				for (let i = 0; i < size % byte.length; byte = '0' + byte, i++);
				return byte;
			})
			.join('');
	}

	_bytesToHex(bytes) {
		return this._bytesToBin(bytes, 16);
	}

	_bytesToStr(bytes) {
		return String.fromCharCode(...bytes);
	}

	getString() {return this.str;}

	setString(str) {
		this.str = str;
		this.bytes = this._strToBytes(str);
		this.bin = this._bytesToBin(this.bytes);
		this.hex = this._bytesToHex(this.bytes);
	}

	getBytes() {return this.bytes;}

	setBytes(bytes) {
		this.str = this._bytesToStr(bytes);
		this.bytes = bytes;
		this.bin = this._bytesToBin(this.bytes);
		this.hex = this._bytesToHex(this.bytes);
	}

	getBinary(pretty = false) {
		return pretty ? this.bin
			.match(/.{1,8}/g)
			.join(' ') :
			this.bin;
	}

	setBinary(bin) {
		// Plain string of 0 and 1
		// Like this one: '0010101100101'
		for (let i = 0; i < bin.length % 8; bin = '0' + bin, i++);
		this.setBytes(bin
			.match(/.{1,8}/g)
			.map(byteString => parseInt(byteString, 2))
		);
	}

	getHex(pretty = false) {
		return pretty ? this.hex
			.match(/.{1,2}/g)
			.join(' ') :
			this.hex;
	}

	setHex(hex) {
		// Plain string of 0-f
		// Like this one: '0f1b101c0270d'
		hex = hex.length % 2 ? '0' + hex : hex;
		this.setBytes(hex
			.match(/.{1,2}/g)
			.map(byteString => parseInt(byteString, 16))
		);
	}
}