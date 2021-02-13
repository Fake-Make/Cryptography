import { Component, OnInit } from '@angular/core';

import { RSA } from '@core/rsa';
import { Converter } from '@core/converter';
import { Gamma } from '@core/gamma';
import { DES } from '@core/des';

@Component({
  selector: 'app-work6',
  templateUrl: './work6.component.html',
  styleUrls: ['./work6.component.css']
})
export class Work6Component implements OnInit {
  bits: number = 128;
  keysRsa: {
    e: bigint,
    d: bigint,
    n: bigint
  } = {e: 0n, d: 0n, n: 0n};

  keyDes: string = '';
  keyDesEncrypted: string = '';
  keyDesDecrypted: string = '';

  base: string = 'Hello Darkness my old friend! I\'ve come to talk with you again';
  cipher: string = '';

  viewModes = ['Str', 'Bin', 'Hex'];
  views = {base: 0, cipher: 0};

  constructor() {}

  ngOnInit(): void {
    this.generateRsa();
    this.generateDes();
    this.keyDesEncrypted = this.encryptRsa(this.keyDes);
    this.keyDesDecrypted = this.decryptRsa(this.keyDesEncrypted);
    this.encryptDes();
  }

  generateRsa() {
    const keys = RSA.getKeys(this.bits);
    this.keysRsa.e = keys.public.e;
    this.keysRsa.d = keys.private.d;
    this.keysRsa.n = keys.private.n;
  }

  generateDes() {
    this.keyDes = Gamma.getSimpleGamma(64);
  }

  encryptRsa(strBin: string): string {
    return RSA.encrypt(strBin, {e: this.keysRsa.e, n: this.keysRsa.n});
  }

  decryptRsa(strBin: string): string {
    return RSA.decrypt(strBin, {d: this.keysRsa.d, n: this.keysRsa.n});
  }

  changeView(key: 'base' | 'cipher') {
    this.views[key] = (this.views[key] + 1) % this.viewModes.length;
    const from = this[key];
    const to = [
      Converter.hexToStr.bind(Converter),
      Converter.strToBin.bind(Converter),
      Converter.binToHex.bind(Converter)
    ][this.views[key]](from);
    this[key] = to;
  }

  encryptDes(): void {
    this.applyCipher(this.getBin('base'), 'direct');
  }

  decryptDes(): void {
    this.applyCipher(this.getBin('base'), 'reverse');
  }

  protected applyCipher(strBin: string, direction: 'direct' | 'reverse'): void {
    const binCipher = new DES(this.keyDesDecrypted).apply(strBin, direction === 'direct');
    this.cipher = this.fromBin('cipher', binCipher);
  }

  protected getBin(key: 'base' | 'cipher'): string {
    const from = this[key];
    return [
      Converter.strToBin.bind(Converter),
      (from: string) => from,
      Converter.hexToBin.bind(Converter)
    ][this.views[key]](from);
  }

  protected fromBin(key: 'base' | 'cipher', bin: string): string {
    return [
      Converter.binToStr.bind(Converter),
      (bin: string) => bin,
      Converter.binToHex.bind(Converter)
    ][this.views[key]](bin);
  }
}
