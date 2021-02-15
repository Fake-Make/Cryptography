import { BusyService } from '@/app/services/busy/busy.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Primals } from '@core/primals';

@Component({
  selector: 'app-work5',
  templateUrl: './work5.component.html',
  styleUrls: ['./work5.component.css']
})
export class Work5Component implements OnInit {
  // 1.1
  randomNumberBits: number = 64;
  millerRabinRepeatitions: number = 10;
  primalNumber1: bigint = 0n;
  // 2
  primalRoots: string = '';
  // 1.2
  rangeMin: string = (1e19).toString();
  rangeMax: string = (1e19 + 1e5).toString();
  primalNumbers: string = '';

  // 3
  n: bigint = 0n;
  g: bigint = 2n;
  XA: bigint = 0n;
  XB: bigint = 0n;
  YA: bigint = 0n;
  YB: bigint = 0n;
  KA: bigint = 0n;
  KB: bigint = 0n;

  constructor(
    private _snackBar: MatSnackBar,
    public busyService: BusyService
  ) {}

  ngOnInit(): void {
    const PRIMALS = [0, 1, 2].map(() => Primals.getPrimalNumber(this.randomNumberBits)).sort();
    this.primalNumber1 = PRIMALS[2];
    this.n = PRIMALS[2];
    this.XA = PRIMALS[1];
    this.XB = PRIMALS[0];
  }

  getPrimalNumber() {
    this.dataToBigint();
    const storage = {repeatitions: this.millerRabinRepeatitions, iterations: 1};
    const t0 = performance.now();
    const primal = Primals.getPrimalNumber(this.randomNumberBits, storage);
    this.popup(`Выполнение заняло ${storage.iterations} итераций и ${(performance.now() - t0).toFixed(2)} мс.`);

    return primal;
  }

  getPrimalRoots() {
    this.dataToBigint();
    if (!Primals.millerRabinTest(this.primalNumber1)) {
      this.popup('Поиск первообразных корней доступен только для простых чисел');
      return;
    }

    const t0 = performance.now();
    this.busyService.delayed(() => {
      const roots = Primals.getPrimalRoot(this.primalNumber1);
      this.popup(`Выполнение заняло ${(performance.now() - t0).toFixed(2)} мс.`);
      this.primalRoots = roots.join(', ') + '.';
    });
  }

  getPrimalNumbers() {
    this.dataToBigint();
    const min = BigInt(this.rangeMin);
    const max = BigInt(this.rangeMax);

    if (min > max) {
      this.popup('Минимальное значение дипазона должно быть меньше максимального!');
      return;
    } else if (max - min > BigInt(1000000)) {
      this.popup('Диапазон слишком велик, вам надоест ждать. Снизьте его как минимум до 1.000.000 значений.');
      return;
    }

    const primals: any = [];
    const start = min % 2n === 1n ? min : min + 1n;

    const t0 = performance.now();
    this.busyService.delayed(() => {
      for (let i = start; i <= max; i += 2n) {
        if (Primals.millerRabinTest(i))
          primals.push(i);
      }
      const time = (performance.now() - t0).toFixed(2);
      this.popup(`Выполнение заняло ${time} мс.`);
  
      this.primalNumbers = primals.join(', ') + `.\nВремя выполнения: ${time} мс.`;
    });
  }

  prepareDeffieHellman() {
    this.dataToBigint();
    const t0 = performance.now();
    this.busyService.delayed(() => {
      const PRIMALS = [0, 1, 2].map(() => Primals.getPrimalNumber(this.randomNumberBits)).sort();
      this.popup(`Выполнение заняло ${(performance.now() - t0).toFixed(2)} мс.`);

      this.n = PRIMALS[2];
      this.g = Primals.getPrimalRoot(this.n)[0];
      this.XA = PRIMALS[1];
      this.XB = PRIMALS[0];
    });
  }

  launchDeffieHellman() {
    this.dataToBigint();
    const t0 = performance.now();

    this.busyService.delayed(() => {
      this.g = Primals.getPrimalRoot(this.n)[0];
      this.YA = Primals.powToMod(this.g, this.XA, this.n);
      this.YB = Primals.powToMod(this.g, this.XB, this.n);
      this.KA = Primals.powToMod(this.YB, this.XA, this.n);
      this.KB = Primals.powToMod(this.YA, this.XB, this.n);

      this.popup(`Выполнение заняло ${(performance.now() - t0).toFixed(2)} мс.`);
    });
  }

  protected dataToBigint() {
    this.primalNumber1 = BigInt(this.primalNumber1);
    this.n = BigInt(this.n);
    this.g = BigInt(this.g);
    this.XA = BigInt(this.XA);
    this.XB = BigInt(this.XB);
    this.YA = BigInt(this.YA);
    this.YB = BigInt(this.YB);
    this.KA = BigInt(this.KA);
    this.KB = BigInt(this.KB);
  }

  protected popup(message: string, duration: number = 5): void {
    this._snackBar.open(message, '', {
      duration: duration * 1000,
    });
  }
}
