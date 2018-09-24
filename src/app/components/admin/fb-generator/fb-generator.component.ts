
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

import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

import {DatabaseService} from '../../../services/database.service';
import {FileService} from "../../../services/file.service";
import {UtiliesService} from "../../../services/utilies.service";


@Component({
  selector: 'app-fb-generator',
  templateUrl: './fb-generator.component.html',
  styleUrls: ['./fb-generator.component.scss']
})
export class FbGeneratorComponent implements OnInit{
  public qaToolSearchModel: any;
  public qaToolStartDatemodel: any;
  public qaToolEndDatemodel: any;

  public qaOrderSearchModel: any;
  public qaOrderStartDatemodel: any;
  public qaOrderEndDatemodel: any;

  public showOnlyFinishedOrders = true;
  public showOnlyOneOrder = false;
  public showOnlyOrdersForMachine = false;

  public tools;
  public orders: any;
  public machines: any;
  public selectedMachine: any;


  toolSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.tools.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))

  orderSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.orders.filter(v => v.orderingId.toString().toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))


  toolFormatter = (x: {name: string, version: string}) => x.name + ' ' + x.version;
  orderFormatter = (x: {orderingId: number}) => x.orderingId;

  constructor(private databaseService: DatabaseService, private utilityService: UtiliesService) {  }

  ngOnInit(): void {
    this.databaseService.getAllTools().subscribe((x) => {
      const y = <Array<any>>x;
      this.tools = [];

      for (const i of y) {
        if (i.version !== null) {
          this.tools.push(i);
        }
      }

      console.log('Tools ', this.tools);

    });
    this.databaseService.getAllMachines().subscribe((x) => {
      this.machines = x;
      console.log('Machines ', x);
    });
    this.databaseService.getAllOrders().then((x) => {
      console.log('Orders ', x);
      this.orders = x;
    });
  }


  public generateFBXLS() {

    if (this.showOnlyOneOrder) {
      console.log(this.qaOrderSearchModel.orderingId);
      this.utilityService.generateFeedbackXLSFromOrder(this.qaOrderSearchModel.orderingId);
    } else if (this.showOnlyOrdersForMachine) {
      const start = this.qaOrderStartDatemodel.day + '-' + this.qaOrderStartDatemodel.month + '-' + this.qaOrderStartDatemodel.year;
      const end = this.qaOrderEndDatemodel.day + '-' + this.qaOrderEndDatemodel.month + '-' + this.qaOrderEndDatemodel.year;
      this.utilityService.generateFeedbackXLSFromMachine(start, end, this.selectedMachine.machineId);
    } else {
      const start = this.qaOrderStartDatemodel.day + '-' + this.qaOrderStartDatemodel.month + '-' + this.qaOrderStartDatemodel.year;
      const end = this.qaOrderEndDatemodel.day + '-' + this.qaOrderEndDatemodel.month + '-' + this.qaOrderEndDatemodel.year;
      this.utilityService.generateFeedbackXLSFromOrders(start, end, this.showOnlyFinishedOrders);
    }
  }


  public generateQAXLS() {

    console.log(this.qaToolSearchModel, this.qaToolStartDatemodel, this.qaToolEndDatemodel);
    const start = this.qaToolStartDatemodel.day + '-' + this.qaToolStartDatemodel.month + '-' + this.qaToolStartDatemodel.year;
    const end = this.qaToolEndDatemodel.day + '-' + this.qaToolEndDatemodel.month + '-' + this.qaToolEndDatemodel.year;
    this.utilityService.generateQAXLSFromTool(start, end, this.qaToolSearchModel.toolId);
  }



  public compareMachines(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.machineId === c2.machineId : c1 === c2;
  }
  public changeMachine(machine: any) {
    this.selectedMachine = machine;
  }
}
