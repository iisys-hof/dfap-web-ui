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
import {Headers, Http, RequestOptions} from '@angular/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/Observable';
import {of} from 'rxjs/observable/of';
import {Subject} from 'rxjs/Subject';
import {send} from 'q';
import {DatabaseService} from "./database.service";

@Injectable()
export class UtiliesService {

  private protocol;
  private hostname;
  private port;
  private url;
  private loginCorrectSubject = new Subject<any>();
  private subject = new Subject<any>();

  private activeOrdering = -1;
  private activeOrder = -1;


  constructor(private http: Http, private databaseService: DatabaseService) {
    if (environment.production) {
      this.protocol = window.location.protocol;
      this.hostname = window.location.hostname;
      this.port = window.location.port;
      this.url = this.protocol + '//' + this.hostname + ':' + this.port + '/dfap-feedback/';
    }
    if (!environment.production) {
      this.url = 'https://localhost:8443/dfap-feedback/';
    }
  }

  generateFeedbackXLSFromOrders(start: string, end: string, showOnlyFinishedOrders: boolean) {
    let url = `${this.url}xls/feedback?startDate=${start}&endDate=${end}&isFinished=${showOnlyFinishedOrders}`;
    url = url.replace(' ', '%20');
    console.log(url);
    window.open(url, '_blank');
  }

  generateFeedbackXLSFromMachine(start: string, end: string, machine: number) {
    let url = `${this.url}xls/feedback?startDate=${start}&endDate=${end}&machineId=${machine}`;
    url = url.replace(' ', '%20');
    console.log(url);
    window.open(url, '_blank');
  }

  generateFeedbackXLSFromOrder(orderId: number) {


    let url = `${this.url}xls/feedback/${orderId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    window.open(url, '_blank');
  }

  generateQAXLSFromTool(start: string, end: string, toolId) {
    let url = `${this.url}xls/qa?startDate=${start}&endDate=${end}&toolId=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    window.open(url, '_blank');
  }

  saveXLS(orderId: number) {


    let url = `${this.url}xls/${orderId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    window.open(url, '_blank');
    /*
        window.location.href = url;

       this.http.get(url).toPromise()
          .then(response => console.log(response))
          .catch(this.handleError);
          */

  }

  saveQAXLS(toolId: number) {
    let url = `${this.url}xls/qs/${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    window.open(url, '_blank');

    /*this.http.get(url).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
      */
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  sendLoginState(loginState: boolean) {
    this.loginCorrectSubject.next({ loginState: loginState });
  }

  getLoginState() {
    return this.loginCorrectSubject.asObservable();
  }

  sendMessage(type: string, message: any) {
    console.log('MESSAGE SENT: ' , type, ' ', message);
    this.subject.next({ type: type, message: message });
  }

  clearMessage() {
    this.subject.next();
  }

  subscribeMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  setActiveOrdering(orderId: number) {
    this.activeOrdering = orderId;
    this.sendMessage('order', this.activeOrdering);
  }
  getActiveOrdering() {
    return this.activeOrdering;
  }

  setActiveOrder(order: any) {
    order.orderActive = 1;
    console.log("UPDATE ORDER ACTIVE", order);
    this.activeOrder = order;
    this.storeItem('activeOrder', order);
    this.sendMessage('activeOrder', this.activeOrder);
    this.databaseService.changeOrderActiveState(order, true).subscribe();

  }
  unsetActiveOrder() {
    this.removeItem('activeOrder');
    this.sendMessage('activeOrder', []);

  }
  getActiveOrder() {
    if ( this.getItem('activeOrder') !== null) {
      return  this.getItem('activeOrder');
    }    else {
      return [];
    }
  }


  public storeItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  public getItem(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }
  public removeItem(key: string) {
    localStorage.removeItem(key);
  }

  public storeItemInSession(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  public getItemFromSession(key: string) {
    return JSON.parse(sessionStorage.getItem(key));
  }
  public removeItemFromSession(key: string) {
    sessionStorage.removeItem(key);
  }


}
