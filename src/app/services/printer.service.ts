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

import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '../../../node_modules/@angular/common/http';
import {environment} from '../../environments/environment';
import { Component } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@aspnet/signalr';
import {Observable, Subject} from "rxjs";
import {AppConfig} from "../app.config";

@Injectable()
export class PrinterService {

  private protocol;
  private hostname;
  private port;
  private url;
  private urlVogler;

  private hubConnection: HubConnection;
  private printerStatusUpdate = new Subject<any>();

  private printers: any;
  private a: any;

  constructor(private http2: HttpClient) {
   this.url = AppConfig.getURL(AppConfig.settings.services.printerService);
   this.urlVogler = AppConfig.getURL(AppConfig.settings.services.printerServiceVogler);


    this.a = (data: any) => {
      this.printerStatusUpdate.next({'data': data});
    };

  }
  public getAllPrinters() {
    return this.http2.get(this.urlVogler + 'api/printers');
  }

  public updateMachinePrinter(machineId, address: string) {
    let url = `${this.url}machine/${machineId}`;
    url = url.replace(' ', '%20');
    console.log(url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    return this.http2.put<any>(url, address, httpOptions);
  }

  public setPrintLabel(address, label) {

    let url = `${this.urlVogler}api/printers/${address}/labels/1`;
    url = url.replace(' ', '%20');
    console.log(url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    this.http2.post<any>(url, label, httpOptions).subscribe(x => {
      let url = `${this.urlVogler}api/printers/${address}/remotebuffer`;
      url = url.replace(' ', '%20');
      console.log(url);

      this.http2.post<any>(url, {'length': label.length, 'content': label}, httpOptions).subscribe();

    });
  }

  subscribeToPrinterStatusUpdates(): Observable<any> {
    return this.printerStatusUpdate.asObservable();
  }
  sendPrinterStatusUpdates(msg ){
    this.printerStatusUpdate.next(msg);
  }


  /*
  *
  *  Vom Vogler
  *
  * */

  public connectToPrinterHub() {
    this.createConnection();
    this.startConnection();
}

  public startConnection(): void {
    this.hubConnection
      .start()
      .then(() => {
        this.joinPrinterChannel();
      })
      .catch(err => {

        console.log('Error while establishing connection, retrying...');
        setTimeout(this.startConnection(), 5000);
      });
  }

  public joinPrinterChannel(): void {
   this.getAllPrinters().subscribe(x => {
     const prt = x['result'];
     for (const printer of prt) {
       this.hubConnection.invoke('JoinPrinter', printer.name); //Statusupdate eines druckers abonieren über DruckerNamen (ist in der Rest-Api in der config hitnerlegt) ‚LeavePrinter‘ würde die info wieder deregistrieren
     }
     this.registerOnServerEvents();
    });
  }

  public leavePrinterChannel(): void {
    this.getAllPrinters().subscribe(x => {
      const prt = x['result'];
      for (const printer of prt) {
        this.hubConnection.invoke('LeavePrinter', printer.name);
      }
    });
  }

  public createConnection() {
    this.hubConnection = new HubConnectionBuilder()
    .withUrl(this.urlVogler + 'status')  //z.B "http://localhost:5000/status"
    .build();
  }

  public registerOnServerEvents(): void {
    this.hubConnection.on('stateUpdate', this.a);
  }
  public deregisterOnServerEvents(): void {
    this.hubConnection.off('stateUpdate', this.a);
  }

  disconnectFromPinterHub() {
    this.leavePrinterChannel();
    this.deregisterOnServerEvents();
    setTimeout(() => {
      this.hubConnection.stop();
    }, 2000);


  }
}
