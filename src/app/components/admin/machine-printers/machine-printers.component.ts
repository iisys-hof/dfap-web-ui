/*
 * Copyright 2018 Thomas Winkler
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, OnInit } from '@angular/core';
import {DatabaseService} from '../../../services/database.service';
import {PrinterService} from '../../../services/printer.service';

@Component({
  selector: 'app-machine-printers',
  templateUrl: './machine-printers.component.html',
  styleUrls: ['./machine-printers.component.scss']
})
export class MachinePrintersComponent implements OnInit {

  public availablePrinters; any = [];
  public allPrinters: any = [];
  public machines: any = [];

  public origin: string;


  constructor(private databaseService: DatabaseService, private printerService: PrinterService) { }

  ngOnInit() {

    this.printerService.getAllPrinters().subscribe(x => {
      console.log(x['result']);
      this.availablePrinters = x['result'];

      this.databaseService.getAllMachines().subscribe((y) => {
        console.log(y);
        this.machines = y;
        this.machines = this.machines.sort(function(a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); } );

        for (const m of this.machines) {
          for (const p of this.availablePrinters) {
            if (m.printerAddress === p.name) {
              console.log('printermatch');
              m.printer = p;
            }
          }
          for (let i = 0; i < this.availablePrinters.length; i++) {
            if ( this.availablePrinters[i].name === m.printerAddress) {
              this.availablePrinters.remove(i);
              break;
            }
          }
        }
      });
    });
  }


  onMPDrop(machine: any, e: any) {
    /*if ((machine.printer === null || machine.printer === undefined) && e.dragData.ip === null) {
     return;
    }
*/
    if (!(machine.printer === null || machine.printer === undefined)) {
      this.availablePrinters.push(machine.printer);

    }
      machine.printer = e.dragData;
      this.printerService.updateMachinePrinter(machine.machineId, machine.printer.name).subscribe();
      this.availablePrinters = this.availablePrinters.filter(obj => obj !== e.dragData);

    for (const entry of this.machines) {
      if ( entry !== machine && entry.printer === machine.printer) {
        entry.printer = null;
        this.printerService.updateMachinePrinter(entry.machineId, null).subscribe();
      }
    }


  }

  onMPDrag(machine: any, e: any) {
    console.log(e);
   // machine.printer = null;
  }

  onPDrag(printer: any) {

  }
  onMPRemove(e: any) {
    if (e.dragData === undefined || e.dragData === null) {
      return;
    }
    console.log(e);
    if (this.origin === 'ap') {
      return;
    }

    this.availablePrinters.push(e.dragData);

    for (const entry of this.machines) {

      if ( entry.printer === e.dragData) {
        entry.printer = null;
        this.printerService.updateMachinePrinter(entry.machineId, null).subscribe();
      }
    }
  }
}

