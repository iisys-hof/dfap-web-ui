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

import {Component, OnInit, ViewChild} from '@angular/core';
import {DatabaseService} from '../../services/database.service';
import {UtiliesService} from '../../services/utilies.service';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {AdditionalInformationInsertionComponent} from '../utils/additional-information-insertion/additional-information-insertion.component';

@Component({
  selector: 'app-order-data',
  templateUrl: './order-data.component.html',
  styleUrls: ['./order-data.component.scss']
})
export class OrderDataComponent implements OnInit {

  order;

  activeOrderId = -1;

  @ViewChild(AdditionalInformationInsertionComponent) child: AdditionalInformationInsertionComponent;


  constructor(private route: ActivatedRoute, private router: Router, private databaseService: DatabaseService, private utilityService: UtiliesService) {


    this.activeOrderId = this.utilityService.getActiveOrder()['orderingId'];
    this.route.params.subscribe( params => {
      if (params['id'] !== undefined) {
        this.databaseService.getOrder(params['id']).then((x) => {
          this.order = x;
        });
      } else {
        if (this.utilityService.getActiveOrder()['orderingId'] !== -1 && this.utilityService.getActiveOrder()['orderingId'] !== undefined) {
          this.databaseService.getOrder(this.utilityService.getActiveOrder()['orderingId']).then((x) => {

            this.order = x;
          });
        }
      }
    });
  }

  ngOnInit() {

  }
  public startOrder(order: any)  {
    this.utilityService.setActiveOrder(order);
    this.activeOrderId = order['orderingId'];
    console.log('ORDER TOOL VERSION ', order);
    if (order.tool.version == null) {
      this.child.openAdditionalDialog();
    } else {
      this.router.navigateByUrl('/orderdata');
    }


  }
  showPackaging() {

    let path = '';
    let name = this.order.tool.name;
    const version = this.order.tool.version;
    name = name.trim();
    name = name.substr(1);
    const article = name.substr(0, 4);
    const toolthousand = name.substr(0, 1);

    path = '/packaging;p1=Verpackungsvorschrift PDF;p2=Verpackungsvorschrift ' + toolthousand + '000;p3=Artikel ' + article + ' Container PA.pdf;origin=orderdata';
    if (environment.production) {
      path = '/packaging;p1=Info-Pools;p2=Verpackungsvorschriften;p3=Fertige PDF Verpackungsvorschriften;p4=Verpackungsvorschrift PDF;p5=Verpackungsvorschrift ' + toolthousand + '000;p6=Artikel ' + article + ' Container PA.pdf;origin=orderdata';
    }
    console.log(path);
    this.router.navigateByUrl(path);
  }

  getSchufo(value: string) {
    if (value === null) {
      return [];
    }
    const schufos1 = value.split('/');
    const schufos2 = [];

    for (const schufo of schufos1) {
      if (schufo !== '000') {
        schufos2.push(schufo);
        schufos2.push(' / ');
      }
    }
    schufos2.pop();
    return schufos2;
  }

}


import { Pipe, PipeTransform } from '@angular/core';
import {environment} from '../../../environments/environment';

@Pipe({
  name: 'limitTo'
})
export class TruncatePipe {
  transform(value: string, first: string, last: string): string {

    if (!value) {
      return '';
    }
    if (value === ' / ') {
      return value;
    }
    let firstI = 0;
    const lastI =  parseInt(last, 10);
    if (first === 'dyn') {
     for (let i = 0; i < value.length; i++) {
       if (value.charAt(i) === '0') {
         firstI++;
       }
       if (value.charAt(i) != '0') {
         break;
       }
     }
     if (firstI >= lastI) {
       return '-';
     }
    } else {
      firstI =  parseInt(first, 10);
    }
    return value.substring(firstI, lastI) + ' mm';
  }
}
