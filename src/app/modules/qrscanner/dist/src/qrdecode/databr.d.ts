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

export declare class QRCodeDataBlockReader {
    blockPointer: number;
    bitPointer: number;
    dataLength: number;
    blocks: any;
    numErrorCorrectionCode: any;
    dataLengthMode: number;
    static sizeOfDataLengthInfo: number[][];
    constructor(blocks: any, version: any, numErrorCorrectionCode: any);
    getNextBits(numBits: any): any;
    NextMode(): any;
    getDataLength(modeIndicator: any): any;
    getRomanAndFigureString(dataLength: any): any;
    getFigureString(dataLength: any): any;
    get8bitByteArray(dataLength: any): any;
    getKanjiString(dataLength: any): any;
    readonly DataByte: any;
}
