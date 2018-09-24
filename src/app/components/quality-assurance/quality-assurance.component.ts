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
import {DatabaseService} from '../../services/database.service';
import {UtiliesService} from '../../services/utilies.service';
import * as pdf from 'pdfjs-dist/build/pdf.combined';
import {DocumentFolder} from '../../models/DocumentFolder';
import {DocumentFile} from '../../models/DocumentFile';
import {environment} from '../../../environments/environment';
import {FileService} from '../../services/file.service';
import {Base64} from 'js-base64';
import {el} from "@angular/platform-browser/testing/src/browser_util";

@Component({
  selector: 'app-quality-assurance',
  templateUrl: './quality-assurance.component.html',
  styleUrls: ['./quality-assurance.component.scss']
})
export class QualityAssuranceComponent implements OnInit {

  public qsValues= [];
  public page = 0;
  public start;
  public toolId;
  public tool;
  public saveState = 0;
  public foldersLoading = false;
  public fileNotFound: Boolean = false;

  public qaInstruction = [];
  public qaEntries = [];
  public qaProperties = [];

  /* ++++PDF+++ */

  private path1: string;
  private path2: string;
  public pdfHasNextSite: Boolean = true;
  public pdfHasPreviousSite: Boolean = true;

  private context: CanvasRenderingContext2D | any;
  private canvas: HTMLCanvasElement;
  private fileviewer: HTMLElement | any;
  private pdfFile: any;

  public fileLoading: Boolean = false;

  public pageNumber;
  public fullscreen: Boolean = false;

  public outlines: any[] = [];
  public outlineNumber  = 0;
  public pdfHasNextOutline: Boolean = false;
  public pdfHasPreviousOutline: Boolean = true;

  public selectedFolder;
  public file: DocumentFile;
  private allowedOutlines = environment.allowedOutlines;


  constructor(private databaseService: DatabaseService, private  utilityService: UtiliesService, private fileService: FileService) {

    this.databaseService.getOrder(this.utilityService.getActiveOrder()['orderingId']).then((x) => {
      this.toolId = x['tool']['toolId'];
      this.tool = x['tool'];
      this.getQAInstructionsForTool();
    });
  }

  private getQAInstructionsForTool() {
    this.databaseService.getQAInstructionsForToolName(this.tool.name).then((x) => {
      console.log("QA For TOOL NAME", x);
      this.qaInstruction = x;
      if (x !== null) {
        this.qaProperties = x.testInstructionPropertyList;
        this.databaseService.getQAEntriesForTool(this.toolId).then((y) => {
          console.log("QA ENTRIES FOR TOOL ID", y);
          this.qaEntries = y;

          for (const qaEntry of this.qaEntries) {
            qaEntry.testInstructionValueList.sort(function(obj1, obj2) {
              return obj1['number'] - obj2['number'];
            });
          }
          this.page = this.qaEntries.length - 1;
        });
      }
    });
  }

  public findProperty(i: number) {
    const obj =  this.qaProperties.find(function (o) { return o.number === i; });
    if (obj !== undefined) {
      return obj;
    } else {
      let o = [];
      o['name'] = 'Unbekannt';
      return o;
    }
  }
  addEntry() {
    this.databaseService.addNewQAInstructionEntryForTool(this.toolId).then((y) => {
      console.log(y);
      this.getQAInstructionsForTool();
    });
  }

  save() {
    this.databaseService.updateInstructionEntryForTool(this.qaEntries, this.toolId).then((x) => {
      console.log('QS Saved', x);
      this.saveState = 1;
      setTimeout(() => this.saveState = 0, 2000);
      this.getQAInstructionsForTool();
    });
  }
  hiddenSave() {
    this.databaseService.updateInstructionEntryForTool(this.qaEntries, this.toolId).then((x) => {
      console.log('QS Saved', x);
    }).catch((error) => {
      this.saveState = 2;
      setTimeout(() => this.saveState = 0, 4000);
      return Promise.reject(error.message || error);
    });
  }

  isEditable(page) {
    return page === this.qaEntries.length - 1;
  }

  changeV(value) {

    if (value['checkValue'] === 1) {
      value['checkValue'] = 0;
    } else {
      value['checkValue'] = 1;
    }
    this.hiddenSave();
  }

  prev() {
    if (this.page > 0) {
      this.page--;
    }
  }
  forward() {
    if (this.page < this.qaEntries.length - 1) {
      this.page++;
    }
  }

  /*::::::::: PDF ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/
  changePage(i) {
    let path = '';

    if (i === 0) {
     path = this.path1;
    } else {
      path = this.path2;
    }

    this.fileLoading = true;
    this.fileService.getFile(path).then((s) => {
      if (s.id == null) {
        this.fileLoading = false;
        this.fileNotFound = true;
      } else {
        this.convertFile(s);
      }
    });
  }
  ngOnInit() {

    this.file = new DocumentFile();
    this.file.mimeType = '';

    this.fileviewer = document.getElementById('file-viewer');
    this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');
    this.foldersLoading = true;
    // PDF Canvas
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();

    if (localStorage.getItem('activeOrder') !== null) {
      console.log(JSON.parse(localStorage.getItem('activeOrder'))['article']);
      this.foldersLoading = true;
      this.loadPDFViaToolName();
    }
  }

  loadPDFViaToolName() {
    let geo: string = JSON.parse(localStorage.getItem('activeOrder'))['tool']['geometry'];
    let variant = JSON.parse(localStorage.getItem('activeOrder'))['tool']['variant'];
    let version = JSON.parse(localStorage.getItem('activeOrder'))['tool']['version'];

    if (version.startsWith('W0')) {
      version = 'W' + version.substr(2, geo.length);
    }


    const toolthousand = geo.substr(0, 1);

    this.path1 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S1.pdf';
    this.path2 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S2.pdf';
    if (environment.production) {
      this.path1 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S1.pdf';
      this.path2 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S2.pdf';

    }

    this.fileLoading = true;
    this.fileService.getFile(this.path2).then((s) => {

      console.log("fileloading viatoolname", this.path2);
      if (s.id == null) {
        //this.fileLoading = false;
        //this.fileNotFound = true;
        this.loadPDFViaArticleNameAndToolVersion();
      } else {
        this.convertFile(s);
      }
    });
  }

  loadPDFViaArticleNameAndToolVersion() {
    let articleName = JSON.parse(localStorage.getItem('activeOrder'))['article']['name'];
    let geo: string = articleName.substr(0, 4);
    let variant = articleName.substr(4, 2);
    let version = JSON.parse(localStorage.getItem('activeOrder'))['tool']['version'];

    if (version.startsWith('W0')) {
      version = 'W' + version.substr(2, geo.length);
    }


    const toolthousand = geo.substr(0, 1);

    this.path1 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S1.pdf';
    this.path2 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S2.pdf';
    if (environment.production) {
      this.path1 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S1.pdf';
      this.path2 = 'QW/PA als PDF für Produktion/' + toolthousand + '000er/' + geo + '_' + variant + '_' + version + '_S2.pdf';

    }

    this.fileLoading = true;
    this.fileService.getFile(this.path2).then((s) => {
      console.log("fileloading via article name", this.path2);
      if (s.id == null) {
        this.fileLoading = false;
        this.fileNotFound = true;
      } else {
        this.convertFile(s);
      }
    });
  }
  fileClicked(file: DocumentFile) {
    this.fileLoading = true;
    if (file !== undefined && file.id !== undefined) {
      this.fileService.getFile(file.id).then((s) => this.convertFile(s));
    } else {
      this.fileLoading = false;
    }
  }

  private convertFile(file: DocumentFile) {
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
  handleResize() {
    console.log('RESIZE');
    if (this.pdfFile) {
      this.openPage(this.pageNumber);
    }
    // Resize cards to height
    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 100;

    document.getElementById('file-viewer-card').style.height = String(windowHeight) + 'px';
    document.getElementById('file-viewer-card').style.maxHeight = String(windowHeight) + 'px';
    document.getElementById('qa-values').style.height = String(windowHeight) + 'px';
    document.getElementById('qa-values').style.maxHeight = String(windowHeight) + 'px';

    // Resize canvas
    this.canvas.width = this.fileviewer.offsetWidth - 40;
    // this.canvas.height = this.fileviewer.offsetHeight - 80;
    this.canvas.height = this.canvas.width * 1.414;

    document.getElementById('image').style.maxHeight = this.fileviewer.offsetHeight - 80 + 'px';
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

  private loadPDF(file: any) {
    pdf.disableStream = true;
    pdf.getDocument(file).then((pdff) => this.storePDFLocally(pdff));
  }

   private storePDFLocally(pdfFile) {
    this.pdfFile = pdfFile;
    //this.openPage(1);

    this.pdfFile.getOutline().then((s) => {
      this.outlines = s;
      if (this.outlines === null) {
        console.log('NO OUTLINES');
        this.outlines = [];
      }
      this.checkAllowedOutline();
    });
  }

  private openOutlineDest(name: string, index) {
    this.outlineNumber = index;
    this.pdfFile.getPageIndex(this.outlines[index].dest[0]).then((sn) => {
      this.openPage(sn + 1);
    });
  }
  private checkAllowedOutline() {
    const x = [];
    for (let i = 0; i < this.outlines.length; i++) {
        if (this.outlines[i].title.includes("Prüfanwe")) {
          x.push(this.outlines[i]);
        }
    }

    this.outlines = x;
    console.log("OUTLINES ALLOWED,", x);

    if (this.outlines.length > 0) {
      this.openOutlineDest(null, 1);
    } else {
      this.openPage(1);
    }
  }
  public nextOutline() {
    console.log("NEXTOUTLINE");
    if (this.outlineNumber + 1 < this.outlines.length && this.pdfHasNextOutline) {
      this.openOutlineDest(null, ++this.outlineNumber);
    }
  }
  public previousOutline() {
    if (this.outlineNumber - 1 >= 0 && this.pdfHasPreviousOutline) {
      this.openOutlineDest(null, --this.outlineNumber);
    }
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

}


interface PageRef {
  gen: Number;
  num: Number;
}


