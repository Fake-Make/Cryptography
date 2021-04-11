import { Converter } from '@core/converter';
import { Gamma } from '@core/gamma';
import { Avalanche } from '@core/avalanche';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, OnInit } from '@angular/core';
import { Label } from 'ng2-charts';
import { GOST } from '@/app/core/gost';
import { DES } from '@/app/core/des';
import { BusyService } from '@/app/services/busy/busy.service';

@Component({
  selector: 'app-work3',
  templateUrl: './work3.component.html',
  styleUrls: ['./work3.component.css']
})
export class Work3Component implements OnInit {
  checkedGost = true;

  viewModes = ['Str', 'Bin', 'Hex'];
  views = {base: 0, gamma: 1, cipher: 0};

  base = 'Hello Darkness my old friend. I\'ve come to talk with you again';
  gamma = '';
  cipher = '';

  target: 'base' | 'gamma' = 'base';
  targetBit = '1';

  researches = '';
  lineChartData: any[] = [
    {data: [0], label: 'Количество изменённых бит'},
  ];
  lineChartLabels: Label[] = ['0'];

  constructor(
    private _snackBar: MatSnackBar,
    public busyService: BusyService
  ) {}

  ngOnInit() {
    this.setLabels(this.checkedGost ? 32 : 16);
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
    const gammaSize = this.checkedGost ? 256 : 64;
    const binGamma = {
      random: Gamma.getSimpleGamma(gammaSize),
      scrambler: Gamma.getScramblerGamma(gammaSize).gamma
    }[method];
    this.gamma = this.fromBin('gamma', binGamma);
  }

  applyCipher(direction: 'direct' | 'reverse'): void {
    const binBase = this.getBin('base');
    const binGamma = this.getBin('gamma');

    const cipher = this.checkedGost ? new GOST(binGamma) : new DES(binGamma);

    const t0 = performance.now();
    const binCipher = cipher.apply(binBase, direction === 'direct');
    this.checkTime(t0);

    this.cipher = this.fromBin('cipher', binCipher);
  }

  updatePlots(): void {
    const t0 = performance.now();
    // Avalances A
    let binGamma = this.getBin('gamma');
    let binBase = this.getBin('base');
    const cipherA = this.checkedGost ? new GOST(binGamma) : new DES(binGamma);
    cipherA.apply(binBase);
    const avalanchesA = cipherA.getAvalanche();

    // Avalances B
    const changeBit = (bits: string, bit: number): string => {
      return bits.slice(0, bit) + +!+bits.slice(bit, bit + 1) + bits.slice(bit + 1);
    }

    if (this.target === 'base')
      binBase = changeBit(binBase, +this.targetBit - 1);
    else
      binGamma = changeBit(binGamma, +this.targetBit - 1);

    const cipherB = this.checkedGost ? new GOST(binGamma) : new DES(binGamma);
    cipherB.apply(binBase);
    const avalanchesB = cipherB.getAvalanche();
    this.checkTime(t0);

    // Plots
    this.setLabels(this.checkedGost ? 32 : 16);
    this.lineChartData = [{
      data: Avalanche.getDifferences(avalanchesA, avalanchesB, this.checkedGost ? 32 : 16),
      label: this.checkedGost ? 'ГОСТ' : 'DES'
    }];
  }

  updateResearches() {
    const binBase = this.getBin('base');
    const binGamma = this.getBin('gamma');

    const Alg = this.checkedGost ? GOST : DES;
    const cipher = (binBase: string, binGamma: string): string => {
      const alg = new Alg(binGamma);
      return alg.apply(binBase);
    };

    const t0 = performance.now();
    this.busyService.delayed(() => {
      const researches = Avalanche.getCriterias(binBase, binGamma, cipher, 'key');
      this.checkTime(t0);
  
      this.researches = `Среднее число битов выхода, изменяющихся ` +
        `при изменении одного бита входного вектора: ${Math.round(researches.averageBits)};\n` +
        `Степень полноты преобразования: ${(100 * researches.conversionCompleteness).toFixed(2)}%;\n` +
        `Степень лавинного эффекта: ${(100 * researches.avalancheDegree).toFixed(2)}%;\n` + 
        `Степень соответствия строгому лавинному критерию: ${(100 * researches.strictAvalancheDegree).toFixed(2)}%.`;
    });
  }

  protected checkTime(initialTime: number) {
    const executionTime = (performance.now() - initialTime).toFixed(2);
    const message = `Время выполнения: ${executionTime} мс.`;
    this._snackBar.open(message, '', {
      duration: 5000,
    });
  }

  private setLabels(iterations: 16 | 32 = 16) {
    this.lineChartLabels = ['Начало', ...'0'.repeat(iterations).split('')
      .map((_, index) => (index + 1).toString()), 'Конец'];
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
