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
import {DatabaseService} from '../../services/database.service';
import {SettingValue, ToolSetting} from '../../models/ToolSetting';

import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {UtiliesService} from '../../services/utilies.service';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-tool-setting',
  templateUrl: './tool-setting.component.html',
  styleUrls: ['./tool-setting.component.scss']
})
export class ToolSettingComponent implements OnInit {


  public toolSettings: ToolSetting[];
  private page = 0;
  private order;

  public saveState = 0;

  machines: any = [];
  selectedMachine: any = [];
  versions: any = [];
  selectedVersion; any = [];
  public variantAndMachineSelected: boolean = true;
  public toolSettingsEntryClicked;

  public toolServiceUser: boolean = false;

  settingsLoading: boolean;


  constructor(private databaseService: DatabaseService, private utilityService: UtiliesService, private modalService: NgbModal, private authService: AuthService) {}

  // Open a dialog, after successfully saving
  openModal(content) {
    console.log(content);
    this.modalService.open(content);
  }

  cssEdits() {
    const css = '.table-left { height: 161px !important; }',
      head = document.head || document.getElementsByTagName('head')[0],
      style: any = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
      // This is required for IE8 and below.
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  }
  // Init component
  ngOnInit() {
    this.settingsLoading = false;

    if (navigator.userAgent.indexOf("Chrome") !== -1){
      this.cssEdits();
    } else if (navigator.userAgent.indexOf("Firefox") !== -1){
      this.cssEdits();
    }

    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();

    this.toolSettings = [];
    //this.toolSettings.push(new ToolSetting());

    // Get Orderdetails
    this.databaseService.getOrder(this.utilityService.getActiveOrder()['orderingId']).then((x) => {
      this.order = x;
      this.selectedMachine = this.order['machine'];

      // Get tool from orderId and then get its versions
      this.databaseService.getVersionsForTool(this.order['tool']['name']).then((y) => {
        this.versions = y;
        this.versions.splice(0, 0, 'Alle Versionen');
        this.selectedVersion = this.versions[0];
        this.getSettings(this.selectedMachine.name, this.order['tool']['name']);
      });

      this.databaseService.getMachinesForTool(this.order.tool.name, null, this.order.machine.machineId).then((x) => {
        this.machines = x;
        this.machines.splice(0, 0, {machineId: -2, name: 'Alle Maschinen'});
      });
    });

    this.authService.oa().loadDiscoveryDocumentAndTryLogin().then(() => {
      this.authService.getUserInfos().then((x) => {
        this.toolServiceUser =  x['groups'].includes('/toolService');
      });
    });


  }
  // Is used to select a entry to stay permanentn on top
  changePermanent(value) {
    console.log('CHANGE PERM ', value);
    if (value.ontop === 1) {
      value.ontop = 0;
    } else {
      value.ontop = 1;
    }
    this.save();
  }

  // Get setting for a specific tool, for a speific machine and specific variant
  getSettingsWithVersion(machineName: string, toolName: string, toolVersion) {
    this.settingsLoading = true;
    this.toolSettings = [];
   // this.toolSettings.push(new ToolSetting());
    this.databaseService.getSettingsForMachineToolAndVariant(machineName, toolName, toolVersion).then((s) => {
      console.log("getSettingsForMachineToolAndVariant", s);
      if (s.length > 0) {
        // Sort descending
        console.log('S UNSORTED ', s);
        s.sort(function(obj1, obj2) {
          return obj2['date'] - obj1['date'];
        });


        // Search for the first permanent settings
        for (let i = 0; i < s.length; i++) {
          if (s[i].ontop === 1) {
            console.log('TOP: ', i);
            const obj = s.splice(i, 1);
            console.log('SPLICED: ', obj);
            s.unshift(obj[0]);
            break;
          }
        }
        // Show only three elements
        for (let i = s.length - 1; i > 3 ; i--) {
          s.pop();
        }
        console.log('S SORTED ', s);
        this.toolSettings = s;
      }
      this.settingsLoading = false;
    });
  }
  // Fetch all tool settings for a specific machine and tool combination
  getSettings(machineName: string, toolName: string) {
    this.getSettingsWithVersion(machineName, toolName, null);
  }


  // ATM save settings by pressing the button, reload afterwards
  // Checks if a variant and a machine is chosen before it saves the values
  save () {
    if (this.selectedVersion !== this.versions[0] && this.selectedMachine.machineId > 0) {
      this.databaseService.sendSettingsForMachineToolAndVariant(this.selectedMachine.name, this.order['tool']['name'], this.selectedVersion, this.toolSettings).then((s) => {
        console.log('Reload');
        this.getSettingsWithVersion(this.selectedMachine.name, this.order['tool']['name'], this.selectedVersion);
        this.saveState = 1;
        setTimeout(() => this.saveState = 0, 2000);
      });
    } else {
      console.log('VARIANTE WÄHLEN');
      document.getElementById('chooseVariantAndMachine').click();

    }
  }

  isPlusButtonEnabled () {
    return this.selectedVersion !== this.versions[0] && this.selectedMachine.machineId > 0;
  }
  isEditable(i) {

    if (this.selectedVersion !== this.versions[0] && this.selectedMachine.machineId > 0 && this.toolServiceUser) {
      if (i === 0) {
        return true;
      } else {
        return false;
      }
    }

    if (this.toolSettings[i] !== undefined && this.toolSettings[i]['ontop'] === 1) {
      return false;
    }
    if (this.toolSettings[0] !== undefined && this.toolSettings[0]['ontop'] === 0 && i >= 1) {
      return false;
    }
    if (i > 1) {
      return false;
    }
    return this.selectedVersion !== this.versions[0] && this.selectedMachine.machineId > 0;
  }

  hiddenSave() {
    if (this.selectedVersion !== this.versions[0] && this.selectedMachine.machineId > 0) {
      this.databaseService.sendSettingsForMachineToolAndVariant(this.selectedMachine.name, this.order['tool']['name'], this.selectedVersion, this.toolSettings).then((s) => {
        setTimeout(() => this.saveState = 0, 2000);
      });
    } else {
      console.log('VARIANTE WÄHLEN');
      document.getElementById('chooseVariantAndMachine').click();

    }
  }

  // Get index of value by property and machine part
  valueIndex(index, nameProperty: string, idMachine: Number) {
    if (typeof this.toolSettings[index] !== 'undefined') {
      const q = this.toolSettings[index].settingValues.findIndex(x => x.property.name === nameProperty
                                                                  && x.machinePart.machinePartId === idMachine);
      if (q === -1) {
        this.toolSettings[index].settingValues.push(new SettingValue(nameProperty, idMachine));
        return this.toolSettings[index].settingValues.length - 1;
      }
      return q;
    }
  }
  // Workaround to recognize value change of che box
  changeCheckbox(i: SettingValue, $event) {
    i.value = $event.target.checked ? '1' : '0';
    this.hiddenSave();
  }

  addEntry() {
    // Put the new entry on second place. Top is permanent
    if (this.selectedVersion !== this.versions[0] && this.selectedMachine.machineId > 0) {

      this.toolSettings.splice(1, 0, new ToolSetting());


      this.save();
    }

  }

  // For Safari: Scroll all tables equaly. Really not perfect....
  onScroll ($event) {
    const list = document.getElementsByClassName('scroll');
    for (let i = 0; i < list.length; i++) {
      list[i].scrollLeft = $event.srcElement.scrollLeft;
    }
  }
  // Select new toolsetting if a different machine or all machines were chosen. All machine uses parameter 'nomachine'.
  // Has 4 different states: 1 variant 1 machine // 1 variant all machines // all versions 1 machine // all versions all machines
  public changeMachine(machine: any) {
    this.selectedMachine = machine;
    if (machine.machineId === -2) {
      if (this.selectedVersion !== this.versions[0]) {
        console.log('EINE VARIANTE VON ALLEN MASCHINEN');
        this.getSettingsWithVersion('nomachine', this.order['tool']['name'], this.selectedVersion);
      } else {
        console.log('ALLE VARIANTEN VON ALLEN MASCHINEN');
        this.getSettings(null,this.order['tool']['name']);
      }
    }
     if (machine.machineId > 0) {
       this.checkVariantAndMachine(-1);
       if (this.selectedVersion !== this.versions[0]) {
         console.log('EINE VARIANTE VON EINER MASCHINE');
         this.getSettingsWithVersion(this.selectedMachine.name, this.order['tool']['name'], this.selectedVersion);
       } else {
         console.log('ALLE VARIANTEN VON EINER MASCHINE');
         this.getSettings(this.selectedMachine.name, this.order['tool']['name']);
       }
    }
  }

  // Order the machines descending
  compareMachines(c1: any, c2: any): boolean {
    return c1 && c2 ? c1.machineId === c2.machineId : c1 === c2;
  }
  // Select new toolsettings if a different variant or all variant were chosen
  // Has 4 different states: 1 variant 1 machine // 1 variant all machines // all versions 1 machine // all versions all machines
  public changeVersion(version: any) {
    if (version === 'Alle Versionen') {
      this.selectedVersion = this.versions[0];

      this.databaseService.getMachinesForTool(this.order.tool.name, null, this.order.machine.machineId).then((x) => {
        this.machines = undefined;
        this.machines = x;
        this.machines.splice(0, 0, {machineId: -2, name: 'Alle Maschinen'});
        this.selectedMachine = this.machines[0];
        this.changeMachine(this.selectedMachine);
      });
    } else {
      this.selectedVersion = version;
      this.databaseService.getMachinesForTool(this.order.tool.name, this.selectedVersion, this.order.machine.machineId).then((x) => {
        this.machines = undefined;

        this.machines = x;
        this.machines.splice(0, 0, {machineId: -2, name: 'Alle Maschinen'});
        this.selectedMachine = this.machines[0];
        this.changeMachine(this.selectedMachine);
      });
    }
  }
  // Order the versions descending
  compareVariants(c1: any, c2: any): boolean {
    return c1 && c2 ? c1 === c2 : c1 === c2;
  }

  checkVariantAndMachine (i) {

    this.variantAndMachineSelected = this.selectedVersion != null && this.selectedMachine.machineId > 0;
    this.toolSettingsEntryClicked = i;

  }

  handleResize() {
    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 400;
    document.getElementById('xscrolltable').style.height = String(windowHeight) + 'px';

  }

}

