import { DES } from '@core/des';

export class EDE {
	private des1: DES;
	private des2: DES;
	private avalanche: string[] = [];

	constructor(key1: string, key2: string) {
		this.des1 = new DES(key1);
		this.des2 = new DES(key2);
	}

	protected E(bits: string): string {
		// e1(d2(e1(p)))
		const encripted = this.des1.apply(
			this.des2.apply(
				this.des1.apply(bits),
				false
			)
		);
		this.avalanche = this.des1.getAvalanche();
		return encripted;
	}

	protected D(bits: string): string {
		// d1(e2(d1(p)))
		const decrypted = this.des1.apply(
			this.des2.apply(
				this.des1.apply(bits, false)
			),
			false
		);
		this.avalanche = this.des1.getAvalanche();
		return decrypted;
	}

	apply(bits: string, direct = true): string {
		return direct ?
			this.E(bits) :
			this.D(bits);
	}

	getAvalanche = (): string[] => this.avalanche;
}
