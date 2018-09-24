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
import {ModalDismissReasons, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatabaseService} from '../../services/database.service';
import {FeedbackEntry, State} from '../../models/FeedbackEntry';
import {UtiliesService} from '../../services/utilies.service';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {Subject} from 'rxjs/Subject';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {environment} from '../../../environments/environment';
import {el} from '@angular/platform-browser/testing/src/browser_util';
import {PrinterService} from "../../services/printer.service";

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {


  public now: Date;i
  public processStartTime: Date;
  public processDuration: Date;
  public activeState: State = 1;
  public orderFinishedDialogOpen = false;
  public lastEndTime: Date = null;

  public startTimeEditable = false; // Make field active
  public endTimeEditable = true; // Make field active
  public editRow = -1;

  public feedbackEntries: FeedbackEntry[];

  public isCheck: boolean;

  public valueOKField = null;
  public valueDevectiveField = null;
  public weightField  = null;
  public speedField  = null;

  public startTimeField: Date = new Date();
  public startDateField: Date = this.startTimeField;
  public endTimeField: Date;
  public endDateField: Date;
  public endDateEdited = false; // True if field was clicked
  public stateName = ['Aufrüsten', 'Anfahren', 'Extrusion', 'Variantenwechsel', 'Abrüsten', 'Fehler'];

  public orderId = '';
  public machineId = '';
  public toolId = '';
  public shift: number;
  public employeeNumber: number;

  public saveState = 0;

  public successMessage: string;
  private success = new Subject<string>();

  public noPrinter: boolean = false;

  private user = {};

  constructor(private router: Router, private databaseService: DatabaseService, private  utilityService: UtiliesService, private modalService: NgbModal, private authService: AuthService, private printerService: PrinterService) {

  }
  changeTime($event) {
    console.log("CGANG TO;E");
    const time = new Date();
    const startTimeStringArray =$event.split(':');
    time.setHours(startTimeStringArray[0], startTimeStringArray[1], 0, 0);
    return time;
  }
  changeDate($event) {
    console.log("CGANG TO;E");
    const time = new Date();
    const endDateStringArray = $event.split('-');
    time.setFullYear(endDateStringArray[0], endDateStringArray[1] - 1, endDateStringArray[2]);
    return time;
  }
// Open a dialog, after successfully saving
  openModal(content) {
    this.modalService.open(content).result.then((result) => {
      console.log('OK', result);
      if (result === 'finish-order') {
        this.finishOrder();
      } else if (result === 'Back-to-orders') {
        this.router.navigateByUrl('/orders');
      }
    }, (reason) => {
      console.log('ABB', reason);

    });
  }

  ngOnInit() {
    this.setStartTimeEditable();
    if (this.utilityService.getItem('activeState') !== null) {
      this.activeState = this.utilityService.getItem('activeState');
    }



    this.feedbackEntries = [];
    this.isCheck = false;

    if (this.utilityService.getItem('shift')) {
      this.shift = this.utilityService.getItem('shift');
    } else {
      this.shift = 1;
    }

    this.employeeNumber = 2;

    this.orderId = this.utilityService.getActiveOrder()['orderingId'];
    this.toolId = this.utilityService.getActiveOrder()['tool']['name'];

    this.databaseService.getFeedbackEntriesForOrder(this.utilityService.getActiveOrder()['orderingId']).then((s) => {
      if (s.length >= this.feedbackEntries.length) {
        this.feedbackEntries = s;
        this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );
        if (this.feedbackEntries.length > 0) {
          this.startTimeField = new Date(this.feedbackEntries[this.feedbackEntries.length - 1].endTime);
          this.startDateField = this.startTimeField;
        }

      }
      this.setStartTimeEditable();
    });


    this.endDateField = new Date();
    this.endTimeField = this.endDateField;


    this.now = new Date();

    if (this.utilityService.getItem('processStartTime') != null) {
      this.processStartTime = new Date(this.utilityService.getItem('processStartTime'));
      console.log("PXSR", this.processStartTime);
      if (this.feedbackEntries.length === 0) {
        this.startTimeField = new Date(this.processStartTime);
        this.startDateField = this.startTimeField;
      }
    } else {
      this.processStartTime = new Date();
    }

    if (this.utilityService.getItem('lastEndTime') != null) {
      this.lastEndTime = new Date(this.utilityService.getItem('lastEndTime'));
    }

    setInterval(() => {
      this.now = new Date();
      this.processDuration = new Date(this.now.valueOf() - this.processStartTime.valueOf() - 3600000);

      if (!this.endDateEdited) {
        this.endDateField = new Date();
        this.endTimeField = this.endDateField;
      }
    }, 900);



    setInterval(() => {
      if (!this.orderFinishedDialogOpen) {
        this.checkAcceptedAmountReached();
      }
    }, 2000);

    this.authService.oa().loadDiscoveryDocumentAndTryLogin().then(() => {
      this.authService.getUserInfos().then((x) => {
        this.user = x;
      });
    });
    this.success.subscribe((message) => this.successMessage = message);
    debounceTime.call(this.success, 5000).subscribe(() => this.successMessage = null);
  }

  resetDuration() {
    this.now = new Date();
    this.processStartTime = new Date();
    this.utilityService.removeItem('processStartTime');
    this.utilityService.storeItem('processStartTime', this.processStartTime.valueOf());
    if (this.feedbackEntries.length === 0) {
      this.startTimeField = new Date(this.processStartTime);
      this.startDateField = this.startTimeField;
    }
  }

  startProcess() {
    this.utilityService.storeItem('activeState', this.activeState);
    this.setStartTimeEditable();
    this.resetDuration();
  }

  prepare() {
    this.activeState = State.prepare;
    this.startProcess();
  }

  startup() {
    this.activeState = State.startup;
    this.startProcess();
  }

  extrusion() {
    this.activeState = State.extrusion;
    this.startProcess();
  }

  variantChange() {
    this.activeState = State.variantChange;
    this.startProcess();
    if ((this.feedbackEntries.length === undefined ||
      this.feedbackEntries.length === null ||
      this.feedbackEntries.length === 0) &&
      this.utilityService.getItem('lastEndTime') !== null) {
        console.log('ENDTIME IN VC');
        this.startTimeField = new Date(this.utilityService.getItem('lastEndTime'));
        this.startDateField = this.startTimeField;
    }

  }

  shutdown() {
    this.activeState = State.shutdown;
    this.startProcess();
  }

  machineError() {
    this.activeState = State.error;
  }
  finishOrder() {
    this.databaseService.getOrder(this.utilityService.getActiveOrder().orderingId).then((x) => {
      x.orderFinished = 1;
      this.databaseService.updateOrder(x).then((y) => {
        console.log(y);
        this.utilityService.unsetActiveOrder();
        this.utilityService.removeItem('activeState');
        this.utilityService.storeItem('lastEndTime', this.feedbackEntries[this.feedbackEntries.length - 1].endTime);
        document.getElementById('finishOrderOkButton').click();
      });
    });
  }

  checkAcceptedAmountReached() {
    if (Number(this.utilityService.getActiveOrder().totalQuantity) <= this.calculateAll(this.feedbackEntries.length - 1)) {
      console.log('VOLL');
      this.orderFinishedDialogOpen = true;
      document.getElementById('order-finish').click();
      return true;
    } else {
      return false;
    }
  }

  addEntry() {
    const startTime = new Date();
    startTime.setFullYear(this.startDateField.getFullYear(), this.startDateField.getMonth(), this.startDateField.getDate());
    startTime.setHours(this.startTimeField.getHours(), this.startTimeField.getMinutes());

    const endTime = new Date();

    endTime.setFullYear(this.endDateField.getFullYear(), this.endDateField.getMonth(), this.endDateField.getDate());
    endTime.setHours(this.endTimeField.getHours(), this.endTimeField.getMinutes());

    console.log('------------------------------------------------');
    console.log('ADD startTime',  startTime);
    console.log('ADD endTime',  endTime);
    console.log('ADD weight',  this.weightField);
    console.log('------------------------------------------------');

    if (!this.checkEntries()) {
      document.getElementById('modalWrongEntry').click();
      console.log('ENTRY WRONG');
      return;
    }
    if (!this.checkTime(startTime, endTime)) {
      document.getElementById('modalWrongTime').click();
      console.log('TIME WRONG');
      return;
    }

    const feedbackEntry = new FeedbackEntry(startTime, endTime, this.valueOKField, this.valueDevectiveField, this.weightField, this.speedField, this.activeState, this.shift, this.user['preferred_username']);
    if (this.editRow !== -1) {
      //feedbackEntry.subProcess =   this.feedbackEntries[this.editRow].subProcess;
      feedbackEntry.feedbackEntryId =   this.feedbackEntries[this.editRow].feedbackEntryId;
      this.feedbackEntries[this.editRow] =  feedbackEntry;

      this.databaseService.sendFeedbackEntry(feedbackEntry);
      this.editRow = -1;
    } else {
      this.feedbackEntries.push(feedbackEntry);
    }
    const timeTemp = new Date();
    timeTemp.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
    timeTemp.setFullYear(endTime.getFullYear(), endTime.getMonth(), endTime.getDate());

    this.startTimeField = new Date(timeTemp.valueOf());
    this.startDateField = this.startTimeField;

    this.valueOKField = null;
    this.valueDevectiveField = null;
    this.weightField = null;
    this.speedField = null;

    const timeTemp2 = new Date();
    this.endTimeField = new Date(timeTemp2.valueOf());
    this.endDateField = this.endTimeField;


    //this.startTimeEditable = this.feedbackEntries.length <= 1;
    this.setStartTimeEditable();

    this.endDateEdited = false;
    this.startProcess();

    let all  = 0;
    for (let y = 0; y < this.feedbackEntries.length; y++) {
      all += Number(this.feedbackEntries[y].accepted) ;
    }
    this.utilityService.sendMessage('amount', all);
    this.utilityService.storeItemInSession('feedbackEntries:' + this.utilityService.getActiveOrder()['orderingId'], this.feedbackEntries);
    this.orderFinishedDialogOpen = false;

    this.resetDuration();

    this.save();
  }

  setStartTimeEditable() {
    // this.startTimeEditable = this.activeState === State.prepare || this.activeState === State.startup || this.activeState === State.variantChange;
    this.startTimeEditable = true;
  }
  calculateAll(i): number {
    let all  = 0;
    for (let y = 0; y <= i; y++) {
      all += Number(this.feedbackEntries[y].accepted) ;
    }

    return all;
  }

  checkEntries(): boolean {

    switch (this.activeState) {
      case State.prepare: {
        this.valueOKField = 0;
        this.valueDevectiveField = 0;
        this.weightField = 0;
        this.speedField = 0;
        return true;
      }
      case State.startup: {
        this.valueOKField = 0;
        if (this.valueDevectiveField < 0 || null === this.valueDevectiveField ||
          this.weightField < 0 || null === this.weightField ||
          this.speedField < 0 || null === this.speedField) {

          this.isCheck = true;
          return false;
        }
        break;
      }
      case State.extrusion: {
        if (this.valueOKField < 0 || null === this.valueOKField ||
          this.valueDevectiveField < 0 || null === this.valueDevectiveField ||
          this.weightField < 0 || null === this.weightField ||
          this.speedField < 0 || null === this.speedField) {

          this.isCheck = true;
          return false;
        }
        break;
      }
      case State.variantChange: {
        this.valueOKField = 0;
        if (this.valueDevectiveField < 0 || null === this.valueDevectiveField ||
          this.weightField < 0 || null === this.weightField ||
          this.speedField < 0 || null === this.speedField) {

          this.isCheck = true;
          return false;
        }
        break;
      }
      case State.shutdown: {
        this.valueOKField = 0;
        this.valueDevectiveField = 0;
        this.weightField = 0;
        this.speedField = 0;
        return true;
      }
    }

    this.isCheck = false;
    return true;
  }

  checkTime(startTime: Date, endTime: Date) {
    const end = Math.trunc(endTime.valueOf() / 60000); // Auf Minuten runden
    const start = Math.trunc(startTime.valueOf() / 60000); // Auf Minuten runden
    const duration = end - start;
    const meter = this.speedField * duration;
    console.log('CHECKTIME StartTime Date       ', startTime);
    console.log('CHECKTIME EndTime Date         ', endTime);
    console.log('CHECKTIME end, start, duration ', end, start, duration);

    if (duration < 1) {
      console.log('duration < 1');
      return false;
    }

    if (this.activeState === State.prepare || this.activeState === State.shutdown) {
      return true;
    }

    const difference = (meter - (this.valueOKField + this.valueDevectiveField)) / meter * 100;

    console.log('CHECKTIME difference           ', difference);
    console.log('------------------------------------------------');

    return Math.abs(difference) < 10;
  }

  save() {
    console.log('SAVE: ', this.feedbackEntries);
    this.databaseService.sendFeedbackEntriesForOrder(this.feedbackEntries, this.utilityService.getActiveOrder()['orderingId']).then((s) => {
      this.databaseService.getFeedbackEntriesForOrder(this.utilityService.getActiveOrder()['orderingId']).then((x) => {
        this.feedbackEntries = x;
        this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );
      });
      this.saveState = 1;
      setTimeout(() => this.saveState = 0, 2000);
    });
  }

  editTableRow(i: number) {
    // Edit only the last row
    if (i < this.feedbackEntries.length - 1) {
      this.editRow = -1;
      return;
    }
    if (this.feedbackEntries[i].employeeNumber != this.user['preferred_username']) {
      this.editRow = -1;

      for (var i = 0; i< document.getElementsByTagName("a").length; i++) {
        if (document.getElementsByTagName("a")[i].id.startsWith("member"))
        document.getElementsByTagName("a")[i].click();
      };
      return;
    }

    this.setStartTimeEditable();
    this.endTimeEditable = (i === this.feedbackEntries.length - 1);
    if ( i === this.editRow) {
      this.endDateEdited = false;
      this.endTimeEditable = true;
      this.editRow = -1;
      this.valueOKField = null;
      this.valueDevectiveField = null;
      this.weightField = null;
      this.speedField = null;
      this.endTimeField = new Date();
      this.endDateField = this.endTimeField;
      this.startTimeField = new Date(this.feedbackEntries[this.feedbackEntries.length - 1].endTime);
      this.startDateField = new Date(this.feedbackEntries[this.feedbackEntries.length - 1].endTime);
      this.activeState = this.feedbackEntries[this.feedbackEntries.length - 1].subProcess.subProcessId;
      this.setStartTimeEditable();
    } else {
      this.endDateEdited = true;
      this.editRow = i;
      this.activeState = this.feedbackEntries[i].subProcess.subProcessId;
      this.startTimeField = new Date(this.feedbackEntries[i].startTime);
      this.startDateField = new Date(this.feedbackEntries[i].startTime);
      this.endTimeField = new Date(this.feedbackEntries[i].endTime);
      this.endDateField = new Date(this.feedbackEntries[i].endTime);
      this.valueOKField = this.feedbackEntries[i].accepted;
      this.valueDevectiveField = this.feedbackEntries[i].rejected;
      this.speedField = this.feedbackEntries[i].speed;
      this.weightField = this.feedbackEntries[i].weight;
    }
  }

  changeShift(i) {
    this.shift = i;
    this.utilityService.storeItem('shift', i);
  }

  showPackaging() {

    let path = '';
    let name = this.utilityService.getActiveOrder().tool.name;
    const version = this.utilityService.getActiveOrder().tool.version;
    name = name.trim();
    name = name.substr(1);
    const article = name.substr(0, 4);
    const toolthousand = name.substr(0, 1);
    path = '/packaging;p1=Verpackungsvorschrift PDF;p2=Verpackungsvorschrift ' + toolthousand + '000;p3=Artikel ' + article + ' Container PA.pdf;origin=feedback';
    if (environment.production) {
      path = '/packaging;p1=Info-Pools;p2=Verpackungsvorschriften;p3=Fertige PDF Verpackungsvorschriften;p4=Verpackungsvorschrift PDF;p5=Verpackungsvorschrift ' + toolthousand + '000;p6=Artikel ' + article + ' Container PA.pdf;origin=feedback';
    }
    console.log(path);
    this.router.navigateByUrl(path);
  }

  calculateMinutes() {
    const startH = this.startTimeField.getHours();
    const startM = this.startTimeField.getMinutes();
    const endH = this.endTimeField.getHours();
    const endM = this.endTimeField.getMinutes();

    const startD = new Date();
    startD.setHours(startH, startM, 0, 0);

    const endD = new Date();
    endD.setHours(endH, endM, 0, 0);


    const m = Math.ceil((endD.valueOf() - startD.valueOf()) / 60000);
    const n = m > 0 ? m : 0;

    return n;
  }
  printSetting() {
    this.databaseService.getOrder(this.utilityService.getActiveOrder()['orderingId']).then(x => {
      console.log(x.machine.printerAddress);
      console.log(x.printDescription);
      if (x.machine.printerAddress === null) {
        this.noPrinter = true;
        setTimeout(() => { this.noPrinter = false; }, 4000);
      } else {
        this.printerService.setPrintLabel(x.machine.printerAddress, x.printDescription);
      }

    });
  }
}

