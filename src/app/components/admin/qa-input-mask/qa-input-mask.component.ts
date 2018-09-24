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
import {Observable} from 'rxjs/Observable';
import {Tool} from '../../../models/ToolSetting';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';

@Component({
  selector: 'app-qa-input-mask',
  templateUrl: './qa-input-mask.component.html',
  styleUrls: ['./qa-input-mask.component.scss']
})
export class QaInputMaskComponent implements OnInit {
  public qaToolSearchModel: any;
  public tools: Array<any>;
  public selectedTool: any;
  public selectedToolIsUnknown: boolean;

  public qaTISearchModel: any;
  public testInstructions: Array<any>;
  public selectedTI: any;
  public selectedTIIsUnknown: boolean;
  private selectedTIIndex = -1;

  public newTool: Tool;
  public toolsInTI: any;
  public testInstruction: TestInstruction;

  public saved = false;
  public notSaved = false;
  public notSavedText;



  search = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.tools.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))


  searchTI = (text$: Observable<string>) =>
    text$
      .debounceTime(200)
      .map(term => term === '' ? []
        : this.testInstructions.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))

  formatter = (x: {name: string}) => x.name;
  constructor(private databaseService: DatabaseService, private modalService: NgbModal) { }

  ngOnInit() {

    this.databaseService.getAllBaseToolsAsAdmin().subscribe((x) => {
      console.log(x);
      this.tools =  <Array<any>>x;
    });
    this.databaseService.getAllQAInstructionsAsAdmin().subscribe((x) => {
      console.log(x);
      this.testInstructions =  <Array<any>>x;
    });
  }

  public generateTestInstruction() {
    this.testInstruction = new TestInstruction();
    this.testInstruction.tool = this.selectedTool;

    for (let i = 0; i < 50; i++) {
      this.testInstruction.testInstructionPropertyList.push(new TestInstructionProperty(i + 1));
    }
  }
  public selectTI(preserveToolsInTI: boolean) {
    console.log('selectTI');

    console.log(this.qaTISearchModel);
    this.selectedTIIndex = this.testInstructions.indexOf(this.qaTISearchModel);

    if (this.qaTISearchModel.name === undefined) {
      this.selectedTIIsUnknown = true;
      return;
    }
    this.selectedTI = this.qaTISearchModel;
    this.testInstruction = this.selectedTI;
    this.setupTestInstruction(preserveToolsInTI);
  }

  public nextTI () {
    if (this.selectedTIIndex < this.testInstructions.length - 1){
      this.qaTISearchModel = this.testInstructions[++this.selectedTIIndex];
      this.selectTI(false);
    }
  }
  public previousTI() {
    if (this.selectedTIIndex > 0){
      this.qaTISearchModel = this.testInstructions[--this.selectedTIIndex];
      this.selectTI(false);
    } else {
        this.selectedTIIndex = 0;
        this.qaTISearchModel = this.testInstructions[this.selectedTIIndex];
        this.selectTI(false);

    }
  }
  public selectTool(preserveToolsInTI: boolean) {
    console.log('selectTool');
    console.log(this.qaToolSearchModel.toolId);

    if (this.qaToolSearchModel.toolId === undefined) {
      this.selectedToolIsUnknown = true;
      return;
    }
    this.selectedTool = this.qaToolSearchModel;


    this.databaseService.getQAInstructionForToolAsAdmin(this.selectedTool.toolId).then((x) => {
      console.log('getQAInstructionForToolAsAdmin', x[0]);

      this.testInstruction = x[0];
      if (this.testInstruction === null) {
        this.generateTestInstruction();
      }
      this.setupTestInstruction(preserveToolsInTI);
    });
  }
  setupTestInstruction(preserveToolsInTI: boolean) {
    console.log('setupTestInstruction');

    if (this.testInstruction.testInstructionPropertyList !== null) {
      this.testInstruction.testInstructionPropertyList.sort(function(obj1, obj2) {
        return obj1['number'] - obj2['number'];
      });
    }
    for (let i = 0; i < 50; i++) {
      if (this.testInstruction.testInstructionPropertyList.length <= i) {
        this.testInstruction.testInstructionPropertyList.push(new TestInstructionProperty(i + 1));
      }
      if (this.testInstruction.testInstructionPropertyList[i].number !== i + 1) {
        this.testInstruction.testInstructionPropertyList.splice(i, 0, new TestInstructionProperty(i + 1));
      }
    }
    if (!preserveToolsInTI) {
      let toA = [];
      this.testInstruction.toolList.forEach((tool) => {
        if (!toA.includes(tool.name.substr(1))) {
          toA.push(tool.name.substr(1));
        }
      });


    console.log("TOA", toA);

      this.toolsInTI = '';
      toA.forEach((tool) => {

        this.toolsInTI += tool;
        this.toolsInTI += ', ';
      });
    }


  }
  public findTool(name, variant) {
    const obj =  this.tools.find(function (o: Tool) { return o.name === name && o.variant === variant; });
    this.qaToolSearchModel = obj;
    this.selectedTool = obj;
    this.selectedToolIsUnknown = false;
  }

  public findTI(name) {
    const obj =  this.testInstructions.find(function (o: Tool) { return o.name === name });
    this.qaTISearchModel = obj;
    this.selectedTI = obj;
    this.selectedTIIsUnknown = false;
  }
  public createTool() {
    console.log(this.newTool);
    this.newTool.variant = this.newTool.variant.trim();
    this.newTool.name = this.newTool.name.trim();
    this.databaseService.sendNewToolAsAdmin(this.newTool).then((x) => {
      this.databaseService.getAllBaseToolsAsAdmin().subscribe((y) => {
        console.log('fffh', y);
        this.tools =  <Array<any>>y;
        this.findTool(this.newTool.name, this.newTool.variant);
        this.selectTool(false);
      });
    });
  }
  public createTI() {
    const ti = new TestInstruction();
    ti.date = new Date();
    ti.name = this.qaTISearchModel;
    this.databaseService.sendNewTestInstructionAsAdmin(ti).then((x) => {
      this.saved = true;
      setTimeout(() => {this.saved = false; }, 2000);
      this.databaseService.getAllQAInstructionsAsAdmin().subscribe((x) => {
        this.testInstructions =  <Array<any>>x;
        this.findTI(this.qaTISearchModel);
        this.selectTI(false);
      });
    }).catch((error) => {
      console.log(error._body);
      this.notSaved = true;
      this.notSavedText = error._body;
      setTimeout(() => {this.notSaved = false; }, 4000);

      return Promise.reject(error.message || error);
    });
  }
  public openCreateToolDialog() {

      this.newTool = new Tool();
      this.newTool.name = this.qaToolSearchModel.split(' ')[0];
      this.newTool.variant = this.qaToolSearchModel.split(' ')[1];
      document.getElementById('createToolModal').click();
  }
  openModal(content) {
    this.modalService.open(content).result.then((result) => {
      console.log('f');
      this.createTool();
    });
  }

  public save() {
    console.log(this.testInstruction);
    this.databaseService.updateTestInstructionPropertiesAsAdmin(this.testInstruction.testInstructionPropertyList, this.testInstruction.testInstructionId).then((y) => {
      this.databaseService.updateTestInstructionToolsAsAdmin(this.toolsInTI,
        this.testInstruction.testInstructionId).then((x) => {
        this.saved = true;
        setTimeout(() => {this.saved = false; }, 2000);
        this.reloadData(false);
      }).catch((error) => {
        console.log(error._body);
        this.notSaved = true;
        this.notSavedText = error._body;
        setTimeout(() => {this.notSaved = false; }, 4000);
        this.reloadData(true);
        return Promise.reject(error.message || error);
      });
    }).catch((error) => {
      console.log(error._body);
      this.notSaved = true;
      this.notSavedText = error._body;
      setTimeout(() => {this.notSaved = false; }, 4000);
      this.reloadData(true);
      return Promise.reject(error.message || error);
    });

  }
  private reloadData(preserveToolsInTI: boolean) {
    this.databaseService.getAllBaseToolsAsAdmin().subscribe((z) => {
      this.tools =  <Array<any>>z;
      if (this.selectedTool !== undefined) {
        this.findTool(this.selectedTool.name, this.selectedTool.variant);
        this.selectTool(preserveToolsInTI);
      }
    });
    this.databaseService.getAllQAInstructionsAsAdmin().subscribe((z) => {
      this.testInstructions =  <Array<any>>z;
      if (this.selectedTI !== undefined) {
        this.findTI(this.selectedTI.name);
        this.selectTI(preserveToolsInTI);
      }
    });
  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  public changeCheckboxValue($event, property: TestInstructionProperty, i: number) {
    if (i === 0) {
      if ($event.target.checked === true) {
        if (property.type === 1) {
          property.type = 2;
          console.log(property.type);

          return;
        }

      }
      if ($event.target.checked === false) {
        if (property.type === 0) {
          property.type = 1;
          console.log(property.type);

          return;
        }
        if (property.type === 2) {
          property.type = 1;
          console.log(property.type);

          return;
        }
      }
    } else if (i === 1) {
      if ($event.target.checked === true) {
        if (property.type === 0) {
          property.type = 2;
          console.log(property.type);

          return;
        }
      }
      if ($event.target.checked === false) {
        if (property.type === 1) {
          property.type = 0;
          console.log(property.type);

          return;
        }
        if (property.type === 2) {
          property.type = 0;
          console.log(property.type);

          return;
        }
      }
    }
  }
}

class TestInstruction {
  testInstructionId: number;
  tool: Tool;
  date: Date;
  name: string;
  toolList: Array<any>;
  testInstructionPropertyList: Array<TestInstructionProperty>;

  constructor() {
    this.date = new Date();
    this.testInstructionPropertyList = [];
  }
}

class TestInstructionProperty {
  testInstructionPropertyId: number;
  number: number;
  name: string;
  additionalInfo: string;
  type: number;
  active: number;


  constructor(fieldNumber: number) {
    this.number = fieldNumber;
    this.type = 0;
    this.active = 0;
  }
}
