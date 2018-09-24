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

export declare class AlignmentPattern {
    x: any;
    y: any;
    count: number;
    estimatedModuleSize: any;
    constructor(posX: any, posY: any, estimatedModuleSize: any);
    readonly EstimatedModuleSize: any;
    readonly Count: number;
    readonly X: number;
    readonly Y: number;
    incrementCount: () => void;
    aboutEquals: (moduleSize: any, i: any, j: any) => boolean;
}
export declare class AlignmentPatternFinder {
    image: any;
    possibleCenters: any[];
    startX: any;
    startY: any;
    width: any;
    height: any;
    moduleSize: any;
    crossCheckStateCount: number[];
    resultPointCallback: any;
    imageWidth: number;
    imageHeight: number;
    constructor(image: any, startX: any, startY: any, width: any, height: any, moduleSize: any, imageWidth: number, imageHeight: number, resultPointCallback: any);
    centerFromEnd: (stateCount: any, end: any) => number;
    foundPatternCross: (stateCount: any) => boolean;
    crossCheckVertical: (startI: any, centerJ: any, maxCount: any, originalStateCountTotal: any) => any;
    handlePossibleCenter: (stateCount: any, i: any, j: any) => AlignmentPattern;
    find: () => any;
}
