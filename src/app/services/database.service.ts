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

import {Injectable} from '@angular/core';
import {Http, Jsonp, RequestOptions, RequestOptionsArgs} from '@angular/http';
import {Headers} from '@angular/http';
import {environment} from '../../environments/environment';
import {Tool, ToolSetting} from '../models/ToolSetting';
import {FeedbackEntry} from '../models/FeedbackEntry';
import {HttpClient} from "@angular/common/http";
import {HttpHeaders} from "../../../node_modules/@angular/common/http";
import {AppConfig} from "../app.config";



@Injectable()
export class DatabaseService {
  private orderEndpointUrl;
  private toolsettingsEndpointUrl;
  private feedbackEndpointUrl;

  constructor(private http: Http, private http2: HttpClient, private jsonp: Jsonp) {

      this.orderEndpointUrl = AppConfig.getURL(AppConfig.settings.services.databaseService.order);
      this.toolsettingsEndpointUrl = AppConfig.getURL(AppConfig.settings.services.databaseService.toolSetting);
      this.feedbackEndpointUrl = AppConfig.getURL(AppConfig.settings.services.databaseService.feedback);


      console.log("orderEndpointUrl",this.orderEndpointUrl);
      console.log("toolsettingsEndpointUrl",this.toolsettingsEndpointUrl);
      console.log("feedbackEndpointUrl",this.feedbackEndpointUrl);
  }


  // Toolsettings ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  getAllTools(){
    return this.http2.get(this.toolsettingsEndpointUrl + '/tool');
  }

  getMachinesForTool(toolName, version, machineId)  {
    let url = `${this.toolsettingsEndpointUrl}tool/machinesForTool/${toolName}/${version}/${machineId}`;
    url = url.replace(' ', '%20');
    console.log("getMachinesForTool", url);

    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getSettingsForMachineAndTool(machine: string, tool: string) {
    // get data from server
    let url = `${this.toolsettingsEndpointUrl}tool/${machine}/${tool}`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as ToolSetting)
      .catch(this.handleError);
  }

  sendSettingsForMachineAndTool(machine: string, tool: string, s: ToolSetting[]) {
    let url = `${this.toolsettingsEndpointUrl}tool/${machine}/${tool}`;
    url = url.replace(' ', '%20');
    console.log(url);


    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
     .then(response => console.log(response))
     .catch(this.handleError);
  }

  getVersionsForTool(toolName: string) {
    // get data from server
    let url = `${this.toolsettingsEndpointUrl}tool/${toolName}/variants`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getSettingsForTool(tool: string) {
    // get data from server
    let url = `${this.toolsettingsEndpointUrl}tool/${tool}/toolsettings`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as ToolSetting)
      .catch(this.handleError);
  }

  getSettingsForMachineToolAndVariant(machine: string, tool: string, variant: string) {

    if (machine === null && variant === null && tool !== null) {
      return this.getSettingsForTool(tool);
    }
    // get data from server
    if(machine !== null && tool !== null) {
      let url = "";
      if (variant != null) {
        url = `${this.toolsettingsEndpointUrl}tool/${machine}/${tool}/${variant}`;
      } else {
        url = `${this.toolsettingsEndpointUrl}tool/${machine}/${tool}`;
      }
      url = url.replace(' ', '%20');
      console.log(url);
      return this.http.get(url)
        .toPromise()
        .then(response => response.json() as ToolSetting)
        .catch(this.handleError);
    }
  }

  sendSettingsForMachineToolAndVariant(machine: string, tool: string, version: string, s: ToolSetting[]) {
    let url = `${this.toolsettingsEndpointUrl}tool/${machine}/${tool}/${version}`;
    url = url.replace(' ', '%20');
    console.log(url);

    console.log(s);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }

  // Feedback ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  getFeedbackEntriesForOrder(order: number) {
    // get data from server
    let url = `${this.feedbackEndpointUrl}feedback?order=${order}`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as FeedbackEntry)
      .catch(this.handleError);
  }

  sendFeedbackEntriesForOrder(s: FeedbackEntry[], orderId) {
    let url = `${this.feedbackEndpointUrl}feedback?order=${orderId}`;
    url = url.replace(' ', '%20');
    console.log(url);


    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
      .then(response => response.json() as FeedbackEntry)
      .catch(this.handleError);
  }

  sendFeedbackEntry(s: FeedbackEntry) {
    let url = `${this.feedbackEndpointUrl}feedback/`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }

  deleteFeedback(feedback: FeedbackEntry) {
    let url = `${this.feedbackEndpointUrl}feedback/${feedback.feedbackEntryId}`;
    url = url.replace(' ', '%20');
    console.log(url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };


    return this.http2.delete(url, httpOptions);
  }

  // Orders ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  getOrder(orderId: number) {
    let url = `${this.orderEndpointUrl}order/${orderId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  getToolVersionsForOrder(orderId: number) {
    let url = `${this.orderEndpointUrl}order/${orderId}/tool/versions`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  updateToolVersionForOrder(orderId: number, s: any ) {
    let url = `${this.orderEndpointUrl}order/${orderId}/tool/version`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .catch(this.handleError);
  }

  getAllOrders() {
    let url = `${this.orderEndpointUrl}orders`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }

  updateOrder(s: any) {
    let url = `${this.orderEndpointUrl}order`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .catch(this.handleError);
  }

  changeOrderActiveState(order: any, active) {
    const orderId = order.orderingId;
    let url = `${this.orderEndpointUrl}order/${orderId}/activeState`;
    url = url.replace(' ', '%20');
    console.log(url);

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
      })
    };

    return this.http2.put<any>(url, active, httpOptions);
  }


  // Machines ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  getAllMachines() {
    let url = `${this.orderEndpointUrl}machines`;
    url = url.replace(' ', '%20');
    return this.http2.get(url);
  }

  getOrdersForMachineId(machineId: number) {
    let url = `${this.orderEndpointUrl}machine/${machineId}/orders`;
    url = url.replace(' ', '%20');
    return this.http2.get(url);
  }
  // QS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  /*getQSValuesForTool(toolId: number) {
    let url = `${this.feedbackEndpointUrl}qa/entries?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);

    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  getQAInstructionsForTool(toolId: number) {
    let url = `${this.feedbackEndpointUrl}qa?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);

    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }*/

  getQAInstructionsForToolName(toolName: string) {
    let url = `${this.feedbackEndpointUrl}qa?toolName=${toolName}`;
    url = url.replace(' ', '%20');
    console.log(url);

    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }


  getQAEntriesForTool(toolId: number) {
    let url = `${this.feedbackEndpointUrl}qa/entries?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);

    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  addNewQAInstructionEntryForTool(toolId: number) {
    let url = `${this.feedbackEndpointUrl}qa/entries?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url,null, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }

  sendNewQAInstructionEntryForTool(s: any, toolId: number) {
    let url = `${this.feedbackEndpointUrl}qa/entries?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }
  updateInstructionEntryForTool(s, toolId: number) {
    let url = `${this.feedbackEndpointUrl}qa/entries?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .catch(this.handleError);
  }
  sendQSValuesForTool(s, toolId) {
    let url = `${this.feedbackEndpointUrl}qs/${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }

  sendNewQSValuesForTool(s, toolId) {
    let url = `${this.feedbackEndpointUrl}qs/new/${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }
  // FEEDBACK MS ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  sendNewToolAsAdmin(s: Tool) {
    let url = `${this.feedbackEndpointUrl}/admin/tools`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }

  updateTestInstructionPropertiesAsAdmin(s, testInstruction) {
    let url = `${this.feedbackEndpointUrl}admin/qa/${testInstruction}/properties`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .catch(this.handleError);
  }
  updateTestInstructionToolsAsAdmin(s, testInstruction) {
    let url = `${this.feedbackEndpointUrl}admin/qa/${testInstruction}/tools`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.put(url, s, options).toPromise()
      .catch(this.handleError);
  }

  sendNewTestInstructionAsAdmin(s) {
    let url = `${this.feedbackEndpointUrl}admin/qa`;
    url = url.replace(' ', '%20');
    console.log(url);
    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({headers: headers});
    return this.http.post(url, s, options).toPromise()
      .then(response => console.log(response))
      .catch(this.handleError);
  }

  getAllToolsAsAdmin() {
    return this.http2.get(this.feedbackEndpointUrl + 'admin/tools');
  }

  getAllBaseToolsAsAdmin() {
    return this.http2.get(this.feedbackEndpointUrl + 'admin/tools/base');
  }
  getAllQAInstructionsAsAdmin() {
    return this.http2.get(this.feedbackEndpointUrl + 'admin/qa');
  }

  getQAInstructionForToolAsAdmin(toolId: number) {
    let url = `${this.feedbackEndpointUrl}admin/qa?tool=${toolId}`;
    url = url.replace(' ', '%20');
    console.log(url);

    return this.http.get(url)
      .toPromise()
      .then(response => response.json())
      .catch(this.handleError);
  }
  // Error handling ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }



}
