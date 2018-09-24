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

declare global  {
    interface Array<T> {
        remove(from: T): T[];
    }
}
export declare class FinderPattern {
    static MIN_SKIP: number;
    static MAX_MODULES: number;
    static INTEGER_MATH_SHIFT: number;
    static CENTER_QUORUM: number;
    x: any;
    y: any;
    count: any;
    estimatedModuleSize: any;
    constructor(posX: any, posY: any, estimatedModuleSize: any);
    readonly EstimatedModuleSize: any;
    readonly Count: any;
    readonly X: any;
    readonly Y: any;
    incrementCount: () => void;
    aboutEquals: (moduleSize: any, i: any, j: any) => boolean;
}
export declare class FinderPatternInfo {
    bottomLeft: any;
    topLeft: any;
    topRight: any;
    constructor(patternCenters: any);
    readonly BottomLeft: any;
    readonly TopLeft: any;
    readonly TopRight: any;
}
export declare class FinderPatternFinder {
    width: any;
    height: any;
    image: any;
    possibleCenters: any[];
    hasSkipped: boolean;
    crossCheckStateCount: number[];
    resultPointCallback: any;
    constructor(width: any, height: any);
    readonly CrossCheckStateCount: number[];
    orderBestPatterns: (patterns: any) => void;
    foundPatternCross: (stateCount: any) => boolean;
    centerFromEnd: (stateCount: any, end: any) => number;
    crossCheckVertical: (startI: any, centerJ: any, maxCount: any, originalStateCountTotal: any) => any;
    crossCheckHorizontal: (startJ: any, centerI: any, maxCount: any, originalStateCountTotal: any) => any;
    handlePossibleCenter: (stateCount: any, i: any, j: any) => boolean;
    selectBestPatterns: () => any[];
    findRowSkip: () => number;
    haveMultiplyConfirmedCenters: () => boolean;
    findFinderPattern: (image: any) => FinderPatternInfo;
}
export {};
