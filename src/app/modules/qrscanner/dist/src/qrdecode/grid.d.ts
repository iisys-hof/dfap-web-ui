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

export declare class GridSampler {
    width: number;
    height: number;
    constructor(width: any, height: any);
    checkAndNudgePoints(image: any, points: any): void;
    sampleGrid3(image: any, rawImage: any, dimension: any, transform: any): any;
    sampleGridx(image: any, dimension: any, p1ToX: any, p1ToY: any, p2ToX: any, p2ToY: any, p3ToX: any, p3ToY: any, p4ToX: any, p4ToY: any, p1FromX: any, p1FromY: any, p2FromX: any, p2FromY: any, p3FromX: any, p3FromY: any, p4FromX: any, p4FromY: any): any;
}
