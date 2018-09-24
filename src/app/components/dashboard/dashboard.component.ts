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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {DatabaseService} from "../../services/database.service";
import {HubConnection} from "@aspnet/signalr";
import {Subject, Subscription} from "rxjs";
import {PrinterService} from "../../services/printer.service";



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  public machines;
  public machineFilterModel;
  public filteredMachines;

  private printerUpdateSubscribtion: Subscription;

  public printers;
  public orders;

  constructor(private databaseService: DatabaseService, private printerService: PrinterService) {

  }

  ngOnInit() {
    this.machineFilterModel = "";

    this.databaseService.getAllMachines().subscribe(x => {
      this.machines = x;
      this.machines = this.machines.sort(function(a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); } );
      for (let machine of this.machines) {
        this.findActiveOrderForMachine(machine);
      }
      this.findPrinterForMachine();
    });
  }
  ngOnDestroy() {
    this.printerService.disconnectFromPinterHub();
  }

  findPrinterForMachine() {
       this.printerService.connectToPrinterHub();
    this.printerUpdateSubscribtion = this.printerService.subscribeToPrinterStatusUpdates().subscribe(message => {
      const x = this.machines.filter(v => v.printerAddress === message.data.printerName);
      x[0].printerStatus = message.data;
      console.log(x[0]);
    });

  }


  findActiveOrderForMachine(machine) {
    this.databaseService.getOrdersForMachineId(machine.machineId).subscribe(x => {
      let y: any = x;

      console.log(y.filter(v => v.orderActive === 1)[0]);
      machine.order = y.filter(v => v.orderActive === 1)[0];
    });
  }

  filterMachines(term) {
    if (term.length === 0) {
      return  this.machines;
    }
    return  this.machines.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1);
  }

}
