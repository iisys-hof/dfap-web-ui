
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

export class FeedbackEntry {
  feedbackEntryId: number;
  startTime: Date;
  endTime: Date;
  accepted: number;
  rejected: number;
  weight: number;
  speed: number;
  shift: number;
  employeeNumber: number;
  subProcess: SubProcess;

  constructor( start: Date, end: Date, valueOK: number, rejected: number, weight: number,
               speed: number, state: State, shift: number, employeeNumber: number) {
    this.startTime = start;
    this.endTime = end;
    this.accepted = valueOK;
    this.rejected = rejected;
    this.weight = weight;
    this.speed = speed;
    this.shift = shift;
    this.employeeNumber = employeeNumber;
    this.subProcess = new SubProcess(state);

  }
}


export enum State {
  prepare = 1,
  startup = 2,
  extrusion = 3,
  variantChange = 4,
  shutdown = 5,
  error = 6
}

export class SubProcess {
  constructor(state: State){
    this.subProcessId = state;
  }
  subProcessId: number;
  abbreviation: string;
  name: string;
}
