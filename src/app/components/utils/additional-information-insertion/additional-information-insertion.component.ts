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
import {Tool} from '../../../models/ToolSetting';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DatabaseService} from '../../../services/database.service';
import {Observable} from 'rxjs/Observable';
import {UtiliesService} from '../../../services/utilies.service';
import {Router} from '@angular/router';
import {FeedbackEntry} from "../../../models/FeedbackEntry";

@Component({
  selector: 'app-additional-information-insertion',
  templateUrl: './additional-information-insertion.component.html',
  styleUrls: ['./additional-information-insertion.component.scss']
})
export class AdditionalInformationInsertionComponent implements OnInit {


  @Output() reloadTool = new EventEmitter<any>();


  public qaVersionSearchModel: any;
  public versions = [];
  public selectedVersion: any;
  public saved = false;
  public selectedVersionIsUnknown = false;

  public setActiveOrder = true;
  public orderingId;

  public versionsLoading = false;

  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.versions.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))


  constructor(private router: Router, private databaseService: DatabaseService, private modalService: NgbModal, private utilityService: UtiliesService) { }

  ngOnInit() {
    console.log('INIT WSS');

  }

  public selectVersion() {
    console.log('selectedversionModel', this.qaVersionSearchModel);
    let s: string = this.qaVersionSearchModel;
    s = s.replace(/\s+/g, '');
    if (s.startsWith('w')) {
      s = s.substr(1, s.length - 1);
    }

    if (s.startsWith('W')) {
    }else {
      s = 'W' + s;
    }
    if (s.length < 3 && !s.startsWith('W0')) {
      s = s.substr(0, 1) + '0' + s.substr(1, 2);
    }
    console.log('corrected', s);
    this.qaVersionSearchModel = s;
    this.selectedVersion = this.qaVersionSearchModel;

    this.selectedVersionIsUnknown = !this.versions.includes(this.selectedVersion);

  }

  public save() {
    console.log(this.selectedVersion);


      this.databaseService.updateToolVersionForOrder(this.orderingId, this.selectedVersion).then((x) => {
        console.log('OK');
        this.saved = true;
        setTimeout(() => {this.saved = false; }, 3000);
        this.selectedVersion = undefined;
        this.qaVersionSearchModel = undefined;
        if (this.setActiveOrder) {
          this.databaseService.getOrder(this.orderingId).then((y) => {
            this.utilityService.setActiveOrder(y);
            this.router.navigateByUrl('/orderdata');
          });
        } else {
          this.reloadTool.next();
        }
      });
  }


  public openAdditionalDialog() {
    this.orderingId = this.utilityService.getActiveOrder().orderingId;
    document.getElementById('createToolModal').click();
    this.versionsLoading = true;
    this.databaseService.getToolVersionsForOrder(this.orderingId).then((x) => {
      this.versions = x;
      this.versionsLoading = false;
    });
  }

  public openToolVersionModal(orderingId, setActiveOrder) {
    this.setActiveOrder = setActiveOrder;
    this.orderingId = orderingId;
    document.getElementById('createToolModal').click();
    this.versionsLoading = true;
    this.databaseService.getToolVersionsForOrder(this.orderingId).then((x) => {
      this.versions = x;
      this.versionsLoading = false;
    });
  }

  openModal(content) {
    this.modalService.open(content).result.then((result) => {
      if (result === 'Save') {
        this.save();
      }
    });
  }

}
