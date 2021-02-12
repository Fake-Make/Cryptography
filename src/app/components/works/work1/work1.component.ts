import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Converter } from '@core/converter';
import { Gamma } from '@core/gamma';
import { Statistics } from '@core/statistics';

@Component({
  selector: 'app-work1',
  templateUrl: './work1.component.html',
  styleUrls: ['./work1.component.css']
})
export class Work1Component implements OnInit {
  viewModes = ['Str', 'Bin', 'Hex'];
  views = {base: 0, gamma: 1, cipher: 0};

  base = 'Hello World!';
  gamma = '';
  cipher = '';

  polynoms = [
    {value: '10000110101', preview: 'x10 + x5 + x4 + x2 + 1'},
    {value: '1001000001', preview: 'x10 + x7 + 1'},
    {value: '11000100', preview: 'x7 + x6 + x2'}
  ];
  polynom = this.polynoms[0].value;
  initVal: string = '1001111';
  period: number = 0;

  tests = {chi2: '', balance: '', cyclicity: '', correlation: ''};

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit(): void { }

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

  getSimpleGamma(): void {
    const gammaLength = this.getBin('base').length;
    const binGamma = Gamma.getSimpleGamma(gammaLength);
    this.gamma = this.fromBin('gamma', binGamma);
    this.applyTests();
  }

  getScramblerGamma(): void {
    const gammaLength = this.getBin('base').length;
    const scrGamma: {gamma: string, period: number} =
      Gamma.getScramblerGamma(gammaLength, this.polynom, this.initVal);

    const binGamma = scrGamma.gamma;
    this.gamma = this.fromBin('gamma', binGamma);
    this.period = scrGamma.period;
    this.applyTests();
  }

  applyCipher(): void {
    const binBase = this.getBin('base');
    const binGamma = this.getBin('gamma');

    const t0 = performance.now();
    const binCipher = Gamma.apply(binBase, binGamma);
    this.checkTime(t0);

    this.cipher = this.fromBin('cipher', binCipher);
  }

  protected checkTime(initialTime: number) {
    const executionTime = (performance.now() - initialTime).toFixed(2);
    const message = `Время выполнения: ${executionTime} мс.`;
    this._snackBar.open(message, '', {
      duration: 5000,
    });
  }

  private applyTests(): void {
    const t0 = performance.now();
    const set = this.getBin('gamma');

    const chi2 = Statistics.chiSquaredTest(set);
    this.tests.chi2 = `Значение χ2: ${chi2.chi2.toFixed(4)}. ` + 
      `Критическое значение: ${chi2.criticalValue}.\nГипотеза о равномерности ` +
      `последовательности гаммы ${chi2.isDistributionUniform ? 'подтверждается' :
      'отклоняется'}.`;

    const balance = Statistics.balanceTest(set);
    this.tests.balance = balance.map((range: any, index: number): string =>
        `Интервал #${index + 1} (${range.length} знаков): Разница составила ${
        (range.difference * 100).toFixed(0)}%, тест ${range.testSucceed ? 'пройден' : 'не пройден'}.`)
        .join('\n');
    this.tests.balance += `\nТест ${balance.testSucceed ? 'пройден' : 'не пройден'}.`;

    const cyclicity = Statistics.cyclicityTest(set);
    this.tests.cyclicity = cyclicity.map((range: any, index: number): string =>
      `Циклов по ${index + 1} повторений: Ожидалось ${range.expected.toFixed(4)}, ` +
      `фактически имеется ${range.actual.toFixed(4)}, тест ${range.testSucceed ? 'пройден' : 'не пройден'}.`)
      .join('\n');
    this.tests.cyclicity += `\nТест ${cyclicity.testSucceed ? 'пройден' : 'не пройден'}.`;

    const correlation = Statistics.correlationTest(set);
    this.tests.correlation = correlation.map((range: any, index: number): string =>
      `Сдвиг на ${index + 1}: ${range.accordances} совпадений, ${range.disaccordances} отличий, ` +
      `разница: ${(range.difference_percent * 100).toFixed(0)}%, тест ${range.testSucceed ? 'пройден' : 'не пройден'}.`)
      .join('\n');
    this.tests.correlation += `\nТест ${correlation.testSucceed ? 'пройден' : 'не пройден'}.`;
    this.checkTime(t0);
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
