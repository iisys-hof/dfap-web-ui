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

import * as pdf from 'pdfjs-dist/build/pdf.combined';
import {Base64} from 'js-base64';
import {DocumentFile} from './DocumentFile';
import {environment} from '../../environments/environment';
import {DocumentFolder} from './DocumentFolder';
import {FileService} from "../services/file.service";

export class FileViewer {

  private context: CanvasRenderingContext2D | any;
  private canvas: HTMLCanvasElement;
  private fileviewer: HTMLElement | any;
  private pdfFile: any;

  public fileLoading: Boolean = false;
  public pdfHasNextSite: Boolean = true;
  public pdfHasPreviousSite: Boolean = true;
  public pageNumber;
  public fullscreen: Boolean = false;

  public outlines: any[] = [];
  public outlineNumber  = 0;
  public pdfHasNextOutline: Boolean = true;
  public pdfHasPreviousOutline: Boolean = true;

  public pageRefs: PageRef[];
  public pageRefKeys: any[];
  public rootFolder: DocumentFolder;

  public file: DocumentFile;
  private allowedOutlines = environment.allowedOutlines;


  constructor(d: DocumentFile  ) {

    this.rootFolder = new DocumentFolder();
    this.rootFolder.folder = new Array<DocumentFolder>();


    this.file = new DocumentFile();
    this.file.mimeType = '';

    this.fileviewer = document.getElementById('file-viewer');
    this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    // PDF Canvas

    console.log('xw');

    if (localStorage.getItem('activeOrder') !== null) {

      let name = JSON.parse(localStorage.getItem('activeOrder'))['tool']['name'];
      name = name.trim();
      name = name.substr(1);
    }
    this.fileClicked(d);
  }

  fileClicked(file: DocumentFile) {
    this.fileLoading = true;

  }

   convertFile(file: DocumentFile) {
    console.log(file.mimeType);
    this.file = file;
    this.fileLoading = false;
    if (file.mimeType === 'application/pdf') {
      let x = 'data:application/pdf;base64,';
      x = x.concat(file.content);
      const pdfAsArray = this.convertDataURIToBinary(x);
      this.loadPDF(pdfAsArray);
    }
    if (file.mimeType.indexOf('image/') >= 0) {
      let x = 'data:image/*;base64,';
      x = x.concat(file.content);
      this.file.content = x;
      const img = <HTMLImageElement> document.getElementById('image');
      img.src = this.file.content;
    }
    if (file.mimeType === 'text/plain') {
      this.file.content = file.content;
      document.getElementById('text').innerText = Base64.decode(file.content);
    }
  }

  openPage(pageNumber: Number) {
    this.pageNumber = pageNumber;
    this.checkSiteNextAndback();
    this.pdfFile.getPage(this.pageNumber).then((page) => {
      const vphr = this.canvas.height / page.getViewport(1.0).height;
      const vpwr = this.canvas.width / page.getViewport(1.0).width;
      const x = Math.abs(vpwr) < Math.abs(vphr) ? vpwr : vphr;

      const viewport: any = page.getViewport(x);
      const renderContext = {
        canvasContext: this.context,
        viewport: viewport
      };
      page.render(renderContext);
    });
  }

  nextPDFSite() {
    if (this.pdfFile.numPages > this.pageNumber + 1) {
      this.openPage(++this.pageNumber);
    }
  }
  previousPDFSite() {
    if (0 < this.pageNumber - 1) {
      this.openPage(--this.pageNumber);
    }
  }
  private checkSiteNextAndback() {
    this.pdfHasNextSite = this.pageNumber + 1 < this.pdfFile.numPages;
    this.pdfHasPreviousSite = this.pageNumber - 1 > 0;

    this.pdfHasNextOutline = this.outlineNumber + 1 < this.outlines.length;
    this.pdfHasPreviousOutline = this.outlineNumber - 1 >= 0;
  }

  private storePDFLocally(pdfFile) {
    this.pdfFile = pdfFile;
    this.openPage(1);

    this.pdfFile.getOutline().then((s) => {
      this.outlines = s;
      this.checkAllowedOutline();
    });

    this.pdfFile.getDestinations().then((s) => {
      this.pageRefKeys = Object.keys(s);
      this.pageRefs = s;
    });
  }

  loadPDF(file: any) {
    console.log("FILE*++++++", file);
    pdf.disableStream = true;
    pdf.getDocument(file).then((pdff) => this.storePDFLocally(pdff));
  }

  openOutlineDest(name: string, index) {
    this.outlineNumber = index;
    this.pdfFile.getPageIndex(this.outlines[index].dest[0]).then((sn) => {
      this.openPage(sn + 1);
    });
  }
  checkAllowedOutline() {
    const x = [];

    for (let i = 0; i < this.outlines.length; i++) {
      for (let j = 0; j < this.allowedOutlines.length; j++) {
        if (this.outlines[i].title === this.allowedOutlines[j]) {
          x.push(this.outlines[i]);
        }
      }
    }
    this.outlines = x;
    this.pdfHasNextOutline = this.outlineNumber + 1 < this.outlines.length;
    this.pdfHasPreviousOutline = this.outlineNumber - 1 >= 0;

    setTimeout(() => {
      this.nextOutline();
    }, 1000);
  }
  nextOutline() {
    if (this.outlineNumber + 1 < this.outlines.length) {
      this.openOutlineDest(null, ++this.outlineNumber);
    }
  }
  previousOutline() {
    if (this.outlineNumber - 1 >= 0) {
      this.openOutlineDest(null, --this.outlineNumber);
    }
  }

  // This method ist for named destinations
  openNameDest(name: string, index: Number) {
    console.log(this.pageRefs[name][0]);
    this.pdfFile.getPageIndex(this.pageRefs[name][0]).then((sn) => {
      console.log(sn);
      this.openPage(sn);
    });
  }

  private convertDataURIToBinary(dataURI) {
    const BASE64_MARKER = ';base64,';
    const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    const base64 = dataURI.substring(base64Index);
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }
}


interface PageRef {
  gen: Number;
  num: Number;
}

interface HTMLElement {
  exitFullscreen: any;
  mozCancelFullScreen: any;
  webkitExitFullscreen: any;
  fullscreenElement: any;
  mozFullScreenElement: any;
  webkitFullscreenElement: any;
}
