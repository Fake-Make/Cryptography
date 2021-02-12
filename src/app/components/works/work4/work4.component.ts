import { Converter } from '@core/converter';
import { Gamma } from '@core/gamma';
import { Avalanche } from '@core/avalanche';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { Label } from 'ng2-charts';
import { DES } from '@/app/core/des';
import { EDE } from '@/app/core/ede';

type Convertable = 'base' | 'key1' | 'key2' | 'IVp' | 'IVc' | 'cipher';

@Component({
  selector: 'app-work4',
  templateUrl: './work4.component.html',
  styleUrls: ['./work4.component.css']
})
export class Work4Component implements OnInit {
  checkedEde = true;

  viewModes = ['Str', 'Bin', 'Hex'];
  views = {base: 0, cipher: 0, key1: 1, key2: 1, IVp: 1, IVc: 1};

  base = 'Hello Darkness my old friend. I\'ve come to talk with you again';
  key1 = '';
  key2 = '';
  IVp = '';
  IVc = '';
  cipher = '';

  target: Convertable = 'base';
  targetBit = '1';

  lineChartData: any[] = [
    {data: [0], label: 'Количество изменённых бит'},
  ];
  lineChartLabels: Label[] = ['0'];

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit() {
    this.setLabels(16);
  }

  changeView(key: Convertable) {
    this.views[key] = (this.views[key] + 1) % this.viewModes.length;
    const from = this[key];
    const to = [
      Converter.hexToStr.bind(Converter),
      Converter.strToBin.bind(Converter),
      Converter.binToHex.bind(Converter)
    ][this.views[key]](from);
    this[key] = to;
  }

  getGamma(method: 'random' | 'scrambler' = 'random'): string {
    return {
      random: Gamma.getSimpleGamma(64),
      scrambler: Gamma.getScramblerGamma(64).gamma
    }[method];
  }

  applyCipher(direction: 'direct' | 'reverse' = 'direct'): void {
    const binBase = this.getBin('base');
    const binKey1 = this.getBin('key1');
    const binKey2 = this.getBin('key2');
    const binIVp = this.getBin('IVp');
    const binIVc = this.getBin('IVc');
    let binCipher = '';

    let t0;
    if (this.checkedEde) {
      const ede = new EDE(binKey1, binKey2);
      t0 = performance.now();
      binCipher = ede.apply(binBase, direction === 'direct');
    } else {
      const des = new DES(binKey1);
      t0 = performance.now();
      binCipher = des.pcbc(binBase, binIVc, binIVp, direction === 'direct');
    }

    this.checkTime(t0);
    this.cipher = this.fromBin('cipher', binCipher);
  }

  updatePlots(): void {
    const t0 = performance.now();

    if (this.checkedEde) {
      this.updatePlotEde();
    } else {
      this.updatePlotPcbc();
    }

    this.checkTime(t0);
  }

  getBin(key: Convertable): string {
    const from = this[key];
    return [
      Converter.strToBin.bind(Converter),
      (from: string) => from,
      Converter.hexToBin.bind(Converter)
    ][this.views[key]](from);
  }

  protected checkTime(initialTime: number) {
    const executionTime = (performance.now() - initialTime).toFixed(2);
    const message = `Время выполнения: ${executionTime} мс.`;
    this._snackBar.open(message, '', {
      duration: 5000,
    });
  }

  protected updatePlotEde(): void {
    // Avalances A
    let binBase = this.getBin('base');
    let binKey1 = this.getBin('key1');
    let binKey2 = this.getBin('key2');
    let binIVp = this.getBin('IVp');
    let binIVc = this.getBin('IVc');

    const cipherA = new EDE(binKey1, binKey2);
    cipherA.apply(binBase);
    const avalanchesA = cipherA.getAvalanche();

    // Avalances B
    const changeBit = (bits: string, bit: number): string => {
      return bits.slice(0, bit) + +!+bits.slice(bit, bit + 1) + bits.slice(bit + 1);
    }

    switch(this.target) {
      case 'base': binBase = changeBit(binBase, +this.targetBit - 1); break;
      case 'key1': binKey1 = changeBit(binKey1, +this.targetBit - 1); break;
      case 'key2': binKey2 = changeBit(binKey2, +this.targetBit - 1); break;
      case 'IVp': binIVp = changeBit(binIVp, +this.targetBit - 1); break;
      case 'IVc': binIVc = changeBit(binIVc, +this.targetBit - 1); break;
    }

    const cipherB = new EDE(binKey1, binKey2);
    cipherB.apply(binBase);
    const avalanchesB = cipherB.getAvalanche();

    // Plots
    this.setLabels();
    this.lineChartData = [{
      data: Avalanche.getDifferences(avalanchesA, avalanchesB, 16),
      label: 'DES (EDE)'
    }];
  }

  protected updatePlotPcbc(): void {
    const MAX_BLOCKS = 3;
    // Avalances A
    let binBase = this.getBin('base');
    let binKey1 = this.getBin('key1');
    let binKey2 = this.getBin('key2');
    let binIVp = this.getBin('IVp');
    let binIVc = this.getBin('IVc');

    const cipherA = new DES(binKey1);
    cipherA.pcbc(binBase, binIVc, binIVp, true);
    const avalanchesAE = cipherA.getAvalanchePcbc();
    cipherA.pcbc(binBase, binIVc, binIVp, false);
    const avalanchesAD = cipherA.getAvalanchePcbc();

    // Avalances B
    const changeBit = (bits: string, bit: number): string => {
      return bits.slice(0, bit) + +!+bits.slice(bit, bit + 1) + bits.slice(bit + 1);
    }

    switch(this.target) {
      case 'base': binBase = changeBit(binBase, +this.targetBit - 1); break;
      case 'key1': binKey1 = changeBit(binKey1, +this.targetBit - 1); break;
      case 'key2': binKey2 = changeBit(binKey2, +this.targetBit - 1); break;
      case 'IVp': binIVp = changeBit(binIVp, +this.targetBit - 1); break;
      case 'IVc': binIVc = changeBit(binIVc, +this.targetBit - 1); break;
    }

    const cipherB = new DES(binKey1);
    cipherB.pcbc(binBase, binIVc, binIVp, true);
    const avalanchesBE = cipherB.getAvalanchePcbc();
    cipherB.pcbc(binBase, binIVc, binIVp, false);
    const avalanchesBD = cipherB.getAvalanchePcbc();

    const differencesE = avalanchesAE.slice(0, MAX_BLOCKS).map((iterations18, index) => {
      return Avalanche.getDifferences(iterations18, avalanchesBE[index]);
    }).map((difference, index) => {
      return {
        data: difference,
        label: `DES (PCBC), блок C[${index + 1}]`
      }
    });
    const differencesD = avalanchesAD.slice(0, MAX_BLOCKS).map((iterations18, index) => {
      return Avalanche.getDifferences(iterations18, avalanchesBD[index]);
    }).map((difference, index) => {
      return {
        data: difference,
        label: `DES (PCBC), блок P[${index + 1}]`
      }
    });

    // Plots
    this.setLabels();
    this.lineChartData = this.target === 'base' ?
      [...differencesE, ...differencesD] :
      differencesE;
  }

  protected setLabels(iterations: 16 | 32 = 16) {
    this.lineChartLabels = ['Начало', ...'0'.repeat(iterations).split('')
      .map((_, index) => (index + 1).toString()), 'Конец'];
  }

  protected fromBin(key: Convertable, bin: string): string {
    return [
      Converter.binToStr.bind(Converter),
      (bin: string) => bin,
      Converter.binToHex.bind(Converter)
    ][this.views[key]](bin);
  }
}
