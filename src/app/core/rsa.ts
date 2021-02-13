import { Primals } from '@core/primals';

type PublicKey = {
  e: bigint;
  n: bigint;
};

type PrivateKey = {
  d: bigint;
  n: bigint;
};

type Keys = {
  public: PublicKey;
  private: PrivateKey;
};

export class RSA {
  static getKeys(bits = 128): Keys {
    for(let i = 0; i < 200; i++) {
      const {p, q, n, phi, e, d} = this.generateKeys(bits);
      if (this.gcd(BigInt(e * d), phi) === 1n) {
        return {
          public: {e: e, n: n},
          private: {d: d, n: n}
        };
      }
    }
    throw new Error('Keys generation error!');
  }

  static encrypt(strBin: string, keyPublic: PublicKey): string {
    const {e, n} = keyPublic;
    const k = Math.floor(Math.log2(Number(n)));
    const ke = Math.ceil(Math.log2(Number(n)));
    strBin = this.fill(strBin, k);

    const M = (strBin.match(new RegExp(`[01]{1,${k}}`, 'g')) || []);
    const C = M
      .map((block: string): bigint => BigInt('0b' + block))
      .map((block: bigint): bigint => Primals.powToMod(block, e, n))
      .map((block: bigint): string => block.toString(2))
      .map((block: string): string => this.fill(block, ke));
    return C.join('');
  }

  static decrypt(strBin: string, keyPrivate: PrivateKey): string {
    const {d, n} = keyPrivate;
    const k = Math.floor(Math.log2(Number(n)));
    const ke = Math.ceil(Math.log2(Number(n)));
    strBin = this.fill(strBin, ke);

    const M = strBin.match(new RegExp(`[01]{1,${ke}}`, 'g')) || [];
    const D = M
      .map((block: string): bigint => BigInt('0b'+ block))
      .map((block: bigint): bigint => Primals.powToMod(block, d, n))
      .map((block: bigint): string => block.toString(2))
      .map((block: string): string => this.fill(block, k));
    return D.join('').replace(/^0+/, '');
  }

  protected static fill(str: string, k: number): string {
    return str.length % k ?
      '0'.repeat(k - str.length % k) + str :
      str;
  }

  protected static generateKeys(bits: number = 128): any {
    const p = Primals.getPrimalNumber(bits);
    const q = (() => {
      for (let i = 0; i < 500; i++) {
        const primal = Primals.getPrimalNumber(bits);
        if (primal !== p)
          return primal;
      }
      return 1n;
    })();
    const n = p * q;
    const euler = (p - 1n) * (q - 1n);
    const e = this.getE(euler, bits);
    const d = this.getD(e, euler);

    return {p: p, q: q, n: n, phi: euler, e: e, d: d};
  }

  protected static getE(limit: bigint, bits = 128): bigint {
    for (let i = 1; i < 500; i++) {
      const primal = Primals.getPrimalNumber(bits);
      if (primal < limit && this.gcd(primal, limit) === 1n)
        return primal;
    }
    return 0n;
  }

  // Extended Euclid algorithm for finding d
  protected static getD(e: bigint, phi: bigint): bigint {
    let a = BigInt(e);
    let b = BigInt(phi);

    let x = 0n, y = 1n, u = 1n, v = 0n;
    let q, r, m, n;

    while (a !== 0n) {
      q = b / a;
      r = b % a;
      m = x - u * q;
      n = y - v * q;
      b = a;
      a = r;
      x = u;
      y = v;
      u = m;
      v = n;
    }

    return phi + x;
  }

  protected static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n)
      b = a % (a = b);
    return a;
  }
}
