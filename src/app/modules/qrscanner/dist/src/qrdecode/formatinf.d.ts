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

import { ErrorCorrectionLevel } from "./errorlevel";
export declare class FormatInformation {
    static FORMAT_INFO_MASK_QR: number;
    static FORMAT_INFO_DECODE_LOOKUP: number[][];
    static BITS_SET_IN_HALF_BYTE: number[];
    static L: ErrorCorrectionLevel;
    static M: ErrorCorrectionLevel;
    static Q: ErrorCorrectionLevel;
    static H: ErrorCorrectionLevel;
    static FOR_BITS: ErrorCorrectionLevel[];
    errorCorrectionLevel: any;
    dataMask: any;
    constructor(formatInfo: any);
    readonly ErrorCorrectionLevel: any;
    readonly DataMask: any;
    GetHashCode(): number;
    Equals: (o: any) => boolean;
    static URShift(number: any, bits: any): any;
    static numBitsDiffering(a: any, b: any): number;
    static decodeFormatInformation(maskedFormatInfo: any): FormatInformation;
    static doDecodeFormatInformation(maskedFormatInfo: any): FormatInformation;
    static forBits(bits: any): ErrorCorrectionLevel;
}
