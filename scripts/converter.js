class Converter {
	static bytesToStr(bytes) {
		return String.fromCharCode(...bytes);
	}

	static bytesToBin(bytes) {
		return bytes
			.map(byte => byte.toString(2))
			.map(byte => '0'.repeat(8 - byte.length) + byte)
			.join('');
	}

	static bytesToHex(bytes) {
		return bytes
			.map(byte => byte.toString(16))
			.map(byte => byte.length % 2 ? '0' + byte : byte)
			.join('');
	}
	
	static strToBytes(str) {
		return str.split('').map(char => char.charCodeAt(0));
	}

	static strToBin(str) {
		return this.bytesToBin(this.strToBytes(str));
	}

	static strToHex(str) {
		return this.bytesToHex(this.strToBytes(str));
	}

	static binToBytes(bin) {
		return ('0'.repeat(bin.length % 8 ? 8 - bin.length % 8 : 0) + bin)
			.match(/.{1,8}/g)
			.map(byte => parseInt(byte, 2));
	}

	static binToStr(bin) {
		return this.bytesToStr(this.binToBytes(bin));
	}

	static binToHex(bin) {
		return this.bytesToHex(this.binToBytes(bin));
	}

	static hexToBytes(hex) {
		return (hex.length % 2 ? '0' + hex : hex)
			.match(/.{1,2}/g)
			.map(byte => parseInt(byte, 16));
	}

	static hexToStr(hex) {
		return this.bytesToStr(this.hexToBytes(hex));
	}

	static hexToBin(hex) {
		return this.bytesToBin(this.hexToBytes(hex));
	}
}