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
import {Observable, Subject, Subscription} from 'rxjs/Rx';
import {WebsocketService} from '../../../services/websocket.service';
import {PrinterService} from "../../../services/printer.service";
import {AppConfig} from "../../../app.config";


const printerWSEndpoint = 'wss://localhost:8443/dfap-printer/ws';


export interface LiquidLevel {
  inkLevel: number;
  makeUpLevel: number;

}
export class PrinterStatus {
  time: Date;
  liquidLevel: LiquidLevel;
  prints: number;
  ledState: string;
  stateInfo: string;
  state: string;
}



@Component({
  selector: 'app-printer',
  templateUrl: './printer.component.html',
  styleUrls: ['./printer.component.scss']
})
export class PrinterComponent implements OnInit, OnDestroy {
  public printerSubject: Subject<string>;

  public printers: any;
  public note;
  private printerUpdateSubscribtion: Subscription;

  public printersLoading;



  constructor(private printerService: PrinterService) {

  }

  ngOnInit() {
    console.log(" ngOnInit");

    this.printerService.getAllPrinters().subscribe(x => {
      this.printers = x['result'];
      console.log("ALL PRINTERS", x['result']);

      this.printerService.connectToPrinterHub();

    });

    this.printerUpdateSubscribtion = this.printerService.subscribeToPrinterStatusUpdates().subscribe(message => {
      const x = this.printers.filter(v => v.name === message.data.printerName);
      x[0].printerStatus = message.data;
    });
  }

  ngOnDestroy() {
    this.printerService.disconnectFromPinterHub();
  }

}
