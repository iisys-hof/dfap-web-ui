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
import {DatabaseService} from "../../../services/database.service";
import {Observable} from "../../../../../node_modules/rxjs/Observable";
import {FeedbackEntry} from "../../../models/FeedbackEntry";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {AdditionalInformationInsertionComponent} from "../../utils/additional-information-insertion/additional-information-insertion.component";
import {ModalFeedbackEditComponent} from "../../utils/modal-feedback-edit/modal-feedback-edit.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-edit-feedback',
  templateUrl: './edit-feedback.component.html',
  styleUrls: ['./edit-feedback.component.scss']
})
export class EditFeedbackComponent implements OnInit {


  public orders: any;
  public qaOrderSearchModel: any;
  public ordersLoading = false;

  public feedbackEntries: FeedbackEntry[] = [];
  public orderLoading = false;
  public orderLoaded = false;
  public stateName = ['Aufrüsten', 'Anfahren', 'Extrusion', 'Variantenwechsel', 'Abrüsten', 'Fehler'];

  public tool;
  public orderFinished;

  @ViewChild(ModalFeedbackEditComponent) child: ModalFeedbackEditComponent;
  @ViewChild(AdditionalInformationInsertionComponent) childAdd: AdditionalInformationInsertionComponent;

  orderSearch = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.orders.filter(v => v.orderingId.toString().toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))

   orderFormatter = (x: {orderingId: number}) => x.orderingId;


  constructor(private route: ActivatedRoute, private databaseService: DatabaseService, private modalService: NgbModal) { }

  ngOnInit() {

    this.ordersLoading = true;
    this.databaseService.getAllOrders().then((x) => {
      this.orders = x;
      this.ordersLoading = false;
    });



    this.route.params.subscribe( params => {
      if (params['id'] !== undefined) {
        this.databaseService.getOrder(params['id']).then((x) => {
          this.qaOrderSearchModel = x;
          this.loadOrder();
        });
      }
    });
  }

  public loadOrder() {
    this.orderLoading = true;
    this.databaseService.getFeedbackEntriesForOrder(this.qaOrderSearchModel.orderingId).then((s) => {
      this.feedbackEntries = s;
      this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );
      this.orderLoading = false;
      this.reloadTool();
      this.orderFinished = this.qaOrderSearchModel.orderFinished;
      this.orderLoaded = true;
    });
  }


  calculateAll(i): number {
    let all  = 0;
    for (let y = 0; y <= i; y++) {
      all += Number(this.feedbackEntries[y].accepted) ;
    }

    return all;
  }

  updateFeedback($event: FeedbackEntry) {
    console.log('updateFeedback', $event);
    this.databaseService.sendFeedbackEntry($event).then(x => {
      this.orderLoading = true;
      this.databaseService.getFeedbackEntriesForOrder(this.qaOrderSearchModel.orderingId).then((s) => {
        this.feedbackEntries = s;
        this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );
        this.orderLoading = false;
      });
    });
  }
  storeFeedback($event: FeedbackEntry) {
    this.feedbackEntries.push($event);
    this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );

    this.databaseService.sendFeedbackEntriesForOrder(this.feedbackEntries, this.qaOrderSearchModel.orderingId).then(x => {
      this.orderLoading = true;
      this.databaseService.getFeedbackEntriesForOrder(this.qaOrderSearchModel.orderingId).then((s) => {
        this.feedbackEntries = s;
        this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );
        this.orderLoading = false;
      });
    });
  }
  deleteFeedback(feedback: FeedbackEntry) {
    this.databaseService.deleteFeedback(feedback).subscribe(x => {
      this.orderLoading = true;
      this.databaseService.getFeedbackEntriesForOrder(this.qaOrderSearchModel.orderingId).then((s) => {
        this.feedbackEntries = s;
        this.feedbackEntries = this.feedbackEntries.sort(function(a, b) {return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); } );
        this.orderLoading = false;
      });
    });
  }

  reloadTool() {
    this.databaseService.getOrder(this.qaOrderSearchModel.orderingId).then((x) => {
      console.log(x);
      this.tool = x.tool;
      this.qaOrderSearchModel = x;
    });
  }

  changeFinishOrder() {
    this.orderFinished = !this.orderFinished;

    this.databaseService.getOrder(this.qaOrderSearchModel.orderingId).then((x) => {
      if (this.orderFinished) {
        x.orderFinished = 1;
      } else {
        x.orderFinished = 0;
      }

      this.databaseService.updateOrder(x).then((y) => {
        console.log(y);
        if (y.orderFinished === 1) {
          this.orderFinished = true;
        } else if (y.orderFinished === 0) {
          this.orderFinished = false;
        }
        this.databaseService.getOrder(this.qaOrderSearchModel.orderingId).then((z) => {
          this.qaOrderSearchModel = z;
        });
      });
    });
  }
  removeModel() {
    this.orderLoaded = false;
    this.qaOrderSearchModel = undefined;
    this.ordersLoading = true;
    this.databaseService.getAllOrders().then((x) => {
      this.orders = x;
      this.ordersLoading = false;
    });
  }

}
