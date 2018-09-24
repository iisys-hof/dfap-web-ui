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
import {Tool} from '../../../models/ToolSetting';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-tool-service',
  templateUrl: './tool-service.component.html',
  styleUrls: ['./tool-service.component.scss']
})
export class ToolServiceComponent implements OnInit {

  public qaOrderSearchModel: any;
  public orders: any;
  public selectedOrder: any;
  public saved = false;

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.orders.filter(v => v.orderingId.toString().toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))

  formatter = (x: {orderingId: number}) => 'W' + x.orderingId;

  constructor(private databaseService: DatabaseService, private modalService: NgbModal) { }

  ngOnInit() {
    console.log("INIT WSS");
    this.databaseService.getAllOrders().then((x) => {

      console.log("ORDERS", x);
      this.orders = x;
    });
  }

  public selectTool() {
    console.log(this.qaOrderSearchModel.orderingId);
    this.selectedOrder = this.qaOrderSearchModel;
  }

  public save() {
    console.log(this.selectedOrder);

   this.databaseService.updateOrder(this.selectedOrder).then((x) => {
     console.log('OK');
     this.saved = true;
     setTimeout(() => {this.saved = false; }, 3000);
     this.selectedOrder = undefined;
     this.qaOrderSearchModel = undefined;
     this.databaseService.getAllOrders().then((x) => {
       this.orders = x;
     });
   });
  }

}
