import { Converter } from '@core/converter';
import { Gamma } from '@core/gamma';
import { FeistelsNetwork } from '@core/feistels_network';
import { Avalanche } from '@core/avalanche';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { Label } from 'ng2-charts';

@Component({
  selector: 'app-work2',
  templateUrl: './work2.component.html',
  styleUrls: ['./work2.component.css']
})
export class Work2Component implements OnInit {
  viewModes = ['Str', 'Bin', 'Hex'];
  views = {base: 0, gamma: 1, cipher: 0};

  base = 'Hello World!';
  gamma = '';
  cipher = '';
  vfCase: '0' | '1' | '2' | '3' = '0';

  target: 'base' | 'gamma' = 'base';
  targetBit = '1';

  lineChartData: any[] = [
    {data: [0], label: 'Количество изменённых бит'},
  ];
  lineChartLabels: Label[] = ['0'];

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit() {
    this.lineChartLabels = ['Начало', ...'0'.repeat(16).split('')
      .map((_, index) => (index + 1).toString()), 'Конец'];
  }

  changeView(key: 'base' | 'gamma' | 'cipher') {
    this.views[key] = (this.views[key] + 1) % this.viewModes.length;
    const from = this[key];
    const to = [
      Converter.hexToStr.bind(Converter),
      Converter.strToBin.bind(Converter),
      Converter.binToHex.bind(Converter)
    ][this.views[key]](from);
    this[key] = to;
  }

  getGamma(method: 'random' | 'scrambler' = 'random'): void {
    this.gamma = {
      random: Gamma.getSimpleGamma(32),
      scrambler: Gamma.getScramblerGamma(32).gamma
    }[method];
  }

  applyFeistel(direction: 'direct' | 'reverse'): void {
    const binBase = this.getBin('base');
    const binGamma = this.getBin('gamma');

    const feistel = new FeistelsNetwork(binGamma, +this.vfCase);

    const t0 = performance.now();
    const binCipher = feistel.apply(binBase, direction === 'direct');
    this.checkTime(t0);

    this.cipher = this.fromBin('cipher', binCipher);
  }

  updatePlots(): void {
    const t0 = performance.now();
    // Avalances A
    let binGamma = this.getBin('gamma');
    let binBase = this.getBin('base');
    const feistelsA = [0, 1, 2, 3]
      .map(vfCase => new FeistelsNetwork(binGamma, vfCase));
    feistelsA.forEach(feistel => feistel.apply(binBase));
    const avalanchesA = feistelsA.map(feistel => feistel.getAvalanche());

    // Avalances B
    const changeBit = (bits: string, bit: number): string => {
      return bits.slice(0, bit) + +!+bits.slice(bit, bit + 1) + bits.slice(bit + 1);
    }

    const LABELS = ['Подключ цикличным сдвигом, единичная образующая функция',
      'Подключ цикличным сдвигом, образующая функция S(X) ^ V',
      'Подключ по скремблеру, единичная образующая функция',
      'Подключ по скремблеру, образующая функция S(X) ^ V'];

    if (this.target === 'base')
      binBase = changeBit(binBase, +this.targetBit - 1);
    else
      binGamma = changeBit(binGamma, +this.targetBit - 1);

    const feistelsB = [0, 1, 2, 3]
      .map(vfCase => new FeistelsNetwork(binGamma, vfCase));
    feistelsB.forEach(feistel => feistel.apply(binBase));
    const avalanchesB = feistelsB.map(feistel => feistel.getAvalanche());

    // Plots
    this.lineChartData = [0, 1, 2, 3]
      .map(vfCase => 
        Avalanche.getDifferences(avalanchesA[vfCase], avalanchesB[vfCase]))
      .map((data, vfCase) => ({data: data, label: LABELS[vfCase]}));
    this.checkTime(t0);
  }

  protected checkTime(initialTime: number) {
    const executionTime = (performance.now() - initialTime).toFixed(2);
    const message = `Время выполнения: ${executionTime} мс.`;
    this._snackBar.open(message, '', {
      duration: 5000,
    });
  }

  private getBin(key: 'base' | 'gamma' | 'cipher'): string {
    const from = this[key];
    return [
      Converter.strToBin.bind(Converter),
      (from: string) => from,
      Converter.hexToBin.bind(Converter)
    ][this.views[key]](from);
  }

  private fromBin(key: 'base' | 'gamma' | 'cipher', bin: string): string {
    return [
      Converter.binToStr.bind(Converter),
      (bin: string) => bin,
      Converter.binToHex.bind(Converter)
    ][this.views[key]](bin);
  }
}
