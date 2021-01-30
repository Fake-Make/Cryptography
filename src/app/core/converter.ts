export class Converter {
	static bytesToStr(bytes: number[]): string {
		return String.fromCharCode(...bytes);
	}

	static bytesToBin(bytes: number[]): string {
		return bytes
			.map((byte: number) => byte.toString(2))
			.map((byte: string) => '0'.repeat(8 - byte.length) + byte)
			.join('');
	}

	static bytesToHex(bytes: number[]): string {
		return bytes
			.map((byte: number) => byte.toString(16))
			.map((byte: string) => byte.length % 2 ? '0' + byte : byte)
			.join('');
	}
	
	static strToBytes(str: string): number[] {
		return str.split('').map((char: string) => char.charCodeAt(0));
	}

	static strToBin(str: string): string {
		return this.bytesToBin(this.strToBytes(str));
	}

	static strToHex(str: string): string {
		return this.bytesToHex(this.strToBytes(str));
	}

	static binToBytes(bin: string): number[] {
		return (('0'.repeat(bin.length % 8 ? 8 - bin.length % 8 : 0) + bin)
			.match(/.{1,8}/g) || [])
			.map((byte: string) => parseInt(byte, 2));
	}

	static binToStr(bin: string): string {
		return this.bytesToStr(this.binToBytes(bin));
	}

	static binToHex(bin: string): string {
		return this.bytesToHex(this.binToBytes(bin));
	}

	static hexToBytes(hex: string): number[] {
		return ((hex.length % 2 ? '0' + hex : hex)
			.match(/.{1,2}/g) || [])
			.map((byte: string) => parseInt(byte, 16));
	}

	static hexToStr(hex: string): string {
		return this.bytesToStr(this.hexToBytes(hex));
	}

	static hexToBin(hex: string): string {
		return this.bytesToBin(this.hexToBytes(hex));
	}
}