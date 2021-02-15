import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ModalBusyComponent } from '@components/modal-busy/modal-busy.component';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  constructor(public dialog: MatDialog) {}

  public delayed(callback: any): void {
    const dialogRef = this.dialog.open(ModalBusyComponent);
    setTimeout(() => {
      callback();
      dialogRef.close();
    }, 50);
  }
}
