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

import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DatabaseService} from '../../../services/database.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FeedbackEntry, State, SubProcess} from '../../../models/FeedbackEntry';

@Component({
  selector: 'app-modal-feedback-edit',
  templateUrl: './modal-feedback-edit.component.html',
  styleUrls: ['./modal-feedback-edit.component.scss']
})
export class ModalFeedbackEditComponent implements OnInit {

  @Output() updateFeedback = new EventEmitter<FeedbackEntry>();
  @Output() storeFeedback = new EventEmitter<FeedbackEntry>();

  selectedState;
  selectedState2;
  states = State;
  entry: FeedbackEntry;

  startDate;
  startTime;
  endDate;
  endTime;

  startDate2;
  startTime2;
  endDate2;
  endTime2;


  accepted;
  rejected;
  weight;
  speed;
  shift;
  employeeNumber;


  constructor(private modalService: NgbModal) { }

  ngOnInit() {
  }

  public openFbDialog(entry: FeedbackEntry) {

    if (entry !== null) {
      this.entry = entry;
      this.selectedState = this.entry.subProcess.subProcessId;
      this.selectedState2 = this.entry.subProcess.subProcessId;

      this.startDate = this.entry.startTime;
      this.startTime = this.entry.startTime;

      this.endDate = this.entry.endTime;
      this.endTime = this.entry.endTime;

      this.startDate2 = this.entry.startTime;
      this.startTime2 = this.entry.startTime;

      this.endDate2 = this.entry.endTime;
      this.endTime2 = this.entry.endTime;

      this.accepted = this.entry.accepted;
      this.rejected = this.entry.rejected;

      this.weight = this.entry.weight;
      this.speed = this.entry.speed;

      this.shift = this.entry.shift;
      this.employeeNumber = this.entry.employeeNumber;
    } else {
      this.entry = null;
      this.selectedState = 1;

      this.startDate = new Date();
      this.startTime = new Date();

      this.endDate = new Date();
      this.endTime = new Date();

      this.startDate2 = new Date();
      this.startTime2 = new Date();

      this.endDate2 = new Date();
      this.endTime2 = new Date();

      this.accepted = 0;
      this.rejected = 0;

      this.weight = 0;
      this.speed = 0;

      this.shift = 1;
      this.employeeNumber = 0;
    }


    document.getElementById('createFbModal').click();
  }

  openModal(content) {
    this.modalService.open(content).result.then((result) => {
      console.log(result);
    });
  }

  save() {

    this.startTime2 = new Date(this.startTime2);
    this.endTime2 = new Date(this.endTime2);
    this.startDate2 = new Date(this.startDate2);
    this.endDate2 = new Date(this.endDate2);

    const startTime = new Date();

    startTime.setFullYear(this.startDate2.getFullYear(), this.startDate2.getMonth(), this.startDate2.getDate());
    startTime.setHours(this.startTime2.getHours(), this.startTime2.getMinutes());

    const endTime = new Date();

    endTime.setFullYear(this.endDate2.getFullYear(), this.endDate2.getMonth(), this.endDate2.getDate());
    endTime.setHours(this.endTime2.getHours(), this.endTime2.getMinutes());

    const feedbackEntry = new FeedbackEntry(startTime, endTime, this.accepted, this.rejected, this.weight, this.speed,
                                            this.selectedState2, this.shift, this.employeeNumber);


    if (this.entry === null || this.entry === undefined) {
      this.storeFeedback.next(feedbackEntry);
    } else {
      feedbackEntry.feedbackEntryId = this.entry.feedbackEntryId;
      this.updateFeedback.next(feedbackEntry);
    }
    document.getElementById('closeFbModal').click();
  }

  changeSubProcess($event: State) {
    console.log($event);

    this.selectedState2 = $event;
  }

  changeShift(i) {
    this.shift = i;
  }

  changeTime($event) {
    const time = new Date();
    const startTimeStringArray = $event.split(':');
    time.setHours(startTimeStringArray[0], startTimeStringArray[1], 0, 0);
    return time;
  }

  changeDate($event) {
    const time = new Date();
    const endDateStringArray = $event.split('-');
    time.setFullYear(endDateStringArray[0], endDateStringArray[1] - 1, endDateStringArray[2]);
    return time;
  }
}
