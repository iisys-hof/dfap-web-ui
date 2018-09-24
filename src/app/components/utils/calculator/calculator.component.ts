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

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.scss']
})
export class CalculatorComponent implements OnInit {

  result: any;
  value: any;
  decimal: boolean;
  answer: number;
  total: Array<number>;
  clear: boolean;
  previous_operator: any;

  constructor() {
    this.result = '';
    this.decimal = false;
    this.answer = 0;
    this.total = [];
    this.clear = false;
    this.previous_operator = false;
  }
  ngOnInit() {

  }
  addToCalculation(value) {

    if (this.clear == true) {
      this.result = '';
      this.clear = false;
    }

    if (value == '.') {

      if (this.decimal == true) {
        return false;
      }

      this.decimal = true;

    }

    this.result += value;

  }

  calculate(operator) {

    this.total.push(this.result);
    this.result = '';

    if (this.total.length == 2) {
      let a = Number(this.total[0]);
      let b = Number(this.total[1]);
      let total2;
      if (this.previous_operator == '+') {
         total2 = a + b;
      } else if (this.previous_operator == '-') {
         total2 = a - b;
      } else if (this.previous_operator == '*') {
         total2 = a * b;
      } else {
         total2 = a / b;
      }
      let answer = total2;

      this.total = [];
      this.total.push(answer);
      this.result = total2;
      this.clear = true;
    } else {
      this.clear = false;
    }

    this.decimal = false;
    this.previous_operator = operator;

  }

  getTotal() {
    let a = Number(this.total[0]);
    let b = Number(this.result);
    let total2;
    if (this.previous_operator == '+') {
       total2 = a + b;
    } else if (this.previous_operator == '-') {
       total2 = a - b;
    } else if (this.previous_operator == '*') {
       total2 = a * b;
    } else {
       total2 = a / b;
    }

    if (isNaN(total2)) {
      return false;
    }

    this.result = total2;
    this.total = [];
    this.clear = true;
  }

  delete() {
    this.result = '';
    this.decimal = false;
    this.answer = 0;
    this.total = [];
    this.clear = false;
    this.previous_operator = false;
  }

  changeVorzeichen() {
      this.result = this.result * (-1);
  }

}
