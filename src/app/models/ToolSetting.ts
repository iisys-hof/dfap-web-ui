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

export class ToolSetting {
  constructor () {
    this.settingValues = [];
    this.note = '-';
    this.date = new Date();
  }
  toolSettingId: Number;
  date: Date;
  note: string;
  machine: Machine;
  tool: Tool;
  article: Article;
  settingValues: SettingValue[];

  mimeType: string;
  content: string;
}

class Machine {
  machineId: Number;
  name: string;

}
export class Tool {
  toolId: Number;
  name: string;
  gemometry: string;
  variant: string;
  version: string;
}

class Article {
  articleId: Number;
  name: string;
}

export class SettingValue {
  constructor(name: string, machinePartId: Number) {
    this.property = new Property(name);
    this.machinePart = new MachinePart(machinePartId);
    this.value = '';
  }
  settingValueId: Number;
  value: any;
  property: Property;
  machinePart: MachinePart;
}

class MachinePart {
  constructor(machinePartId: Number) {
    this.machinePartId = machinePartId;
  }
  machinePartId: Number;
  name: string;
}

class Property {
  constructor(name: string) {
    this.name = name;
  }
  propertyId: Number;
  name: string;
  type: Number;
  position: Number;
  category: Category;
}

class Category {
  propertyCategoryId: Number;
  name: string;
}
