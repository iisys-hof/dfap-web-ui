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

import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {UtiliesService} from '../../services/utilies.service';
import {Router} from '@angular/router';
import {AdditionalInformationInsertionComponent} from "../utils/additional-information-insertion/additional-information-insertion.component";
import {PrinterService} from "../../services/printer.service";

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  styleUrls: ['./order-overview.component.scss']
})
export class OrderOverviewComponent implements OnInit {

  orders: any = [];
  machines: any = [];
  selectedMachine: any = [];
  activeOrderId = -1;

  @ViewChild(AdditionalInformationInsertionComponent) child: AdditionalInformationInsertionComponent;


  constructor(private router: Router, private databaseService: DatabaseService, private utilityService: UtiliesService, private printerService: PrinterService) {
  }

  ngOnInit() {
    this.selectedMachine = this.utilityService.getItem('selectedMachine');

    this.databaseService.getAllMachines().subscribe((x) => {
      this.machines = x;
      this.machines = this.machines.sort(function(a, b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0); } );
      this.machines.splice(0, 0, {machineId: -1, name: '-------------'});
    });

    if (this.selectedMachine !== null) {
      this.databaseService.getOrdersForMachineId(this.selectedMachine.machineId).subscribe((x) => {
        this.orders = x;
        this.activeOrderId = this.utilityService.getActiveOrder()['orderingId'];
        console.log("TTT", this.activeOrderId);
      });
      return;
    } else {
      this.selectedMachine = [];
    }

    this.databaseService.getAllOrders().then((x) => {
      this.orders = x;
      this.activeOrderId = this.utilityService.getActiveOrder()['orderingId'];
    });
  }

  public startOrder(order: any)  {
    this.utilityService.setActiveOrder(order);
    this.activeOrderId = order['orderingId'];
    console.log("ORDER TOOL VERSION ", order);
    if (order.tool.version == null) {
      this.child.openAdditionalDialog();
    } else {
      //this.printerService.setPrintLabel(order.machine.printerAddress, order.printDescription);
      this.router.navigateByUrl('/orderdata');
    }


  }
  public showOrderData(orderId) {
    this.router.navigateByUrl('/orderdata/' + orderId);
  }

  public changeMachine(machine: any) {
    this.orders =  [];
    this.selectedMachine = machine;
    this.utilityService.storeItem('selectedMachine', machine);
    if (this.selectedMachine.machineId < 0) {
      this.databaseService.getAllOrders().then((x) => {
        this.orders = x;
      });
      return;
    }
    this.databaseService.getOrdersForMachineId(this.selectedMachine.machineId).subscribe((x) => {
      this.orders = x;
    });
  }

  compareMachines(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.machineId === c2.machineId : c1 === c2;
  }

}
