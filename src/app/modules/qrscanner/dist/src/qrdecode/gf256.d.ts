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

export declare class GF256Poly {
    field: any;
    coefficients: any;
    constructor(field: any, coefficients: any);
    readonly Zero: any;
    readonly Degree: any;
    readonly Coefficients: any;
    getCoefficient(degree: any): any;
    evaluateAt(a: any): any;
    addOrSubtract(other: any): any;
    multiply1(other: any): any;
    multiply2(scalar: any): any;
    multiplyByMonomial(degree: any, coefficient: any): any;
    divide: (other: any) => any;
}
export declare class GF256 {
    expTable: any[];
    logTable: any[];
    zero: any;
    one: any;
    constructor(primitive: any);
    readonly Zero: any;
    readonly One: any;
    buildMonomial(degree: any, coefficient: any): any;
    exp(a: any): any;
    log(a: any): any;
    inverse(a: any): any;
    multiply(a: any, b: any): any;
    static addOrSubtract(a: any, b: any): any;
    static QR_CODE_FIELD: GF256;
    static DATA_MATRIX_FIELD: GF256;
}
