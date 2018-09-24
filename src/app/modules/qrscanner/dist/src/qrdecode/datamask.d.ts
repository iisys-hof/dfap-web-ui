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

export declare class DataMask000 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask001 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask010 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask011 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask100 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    URShift(number: any, bits: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask101 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask110 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask111 {
    unmaskBitMatrix(bits: any, dimension: any): any;
    isMasked: (i: any, j: any) => boolean;
}
export declare class DataMask {
    static DATA_MASKS: DataMask111[];
    static forReference(reference: any): any;
}
