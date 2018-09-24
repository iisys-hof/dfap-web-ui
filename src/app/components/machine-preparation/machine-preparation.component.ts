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

import {Component, OnInit, AfterViewInit, PipeTransform, Pipe} from '@angular/core';
import { environment } from '../../../environments/environment';

import * as pdf from '../../../../node_modules/pdfjs-dist/build/pdf.combined';
import {FileService} from '../../services/file.service';
import {DocumentFolder} from '../../models/DocumentFolder';
import {Base64} from 'js-base64';
import {DocumentFile} from '../../models/DocumentFile';
import {forEach} from '@angular/router/src/utils/collection';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';

@Pipe({ name: 'keys',  pure: false })
export class KeysPipe implements PipeTransform {
  transform(value: any, args: any[] = null): any {
    if (value) {
      return Object.keys(value);
    }
  }
}

@Component({
  selector: 'app-machine-preparation',
  templateUrl: './machine-preparation.component.html',
  styleUrls: ['./machine-preparation.component.scss']
})

export class MachinePreparationComponent implements OnInit, AfterViewInit {
  private context: CanvasRenderingContext2D | any;
  private canvas: HTMLCanvasElement;
  private fileviewer: HTMLElement | any;
  private pdfFile: any;

  public foldersLoading: Boolean = true;
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
  public selectedFolder;
  public file: DocumentFile;

  private allowedOutlines = environment.allowedOutlines;


  constructor(private fileService: FileService) {

  }

  ngOnInit() {
    this.rootFolder = new DocumentFolder();
    this.rootFolder.folder = new Array<DocumentFolder>();
    this.selectedFolder = new DocumentFolder();
    this.selectedFolder.folder = new Array<DocumentFolder>();

    this.file = new DocumentFile();
    this.file.mimeType = '';

    this.fileviewer = document.getElementById('file-viewer');
    this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
    this.context = this.canvas.getContext('2d');

    // PDF Canvas
    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
  }

  handleResize() {
    console.log('RESIZE');
    if (this.pdfFile) {
      this.openPage(this.pageNumber);
    }
    // Resize cards to height
    const windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 100;
    document.getElementById('fileTree').style.height = String(windowHeight) + 'px';
    document.getElementById('fileTree').style.maxHeight = String(windowHeight) + 'px';
    document.getElementById('file-viewer-card').style.height = String(windowHeight) + 'px';
    document.getElementById('file-viewer-card').style.maxHeight = String(windowHeight) + 'px';
    document.getElementById('file-card').style.maxHeight = String(windowHeight) + 'px';

    // Resize canvas
    this.canvas.width = this.fileviewer.offsetWidth - 40;
    // this.canvas.height = this.fileviewer.offsetHeight - 80;
    this.canvas.height = this.canvas.width * 1.414;

    document.getElementById('image').style.maxHeight = this.fileviewer.offsetHeight - 80 + 'px';
  }

  ngAfterViewInit() {
    this.fileService.getRoot().then((s) => {
      this.foldersLoading = false;
      this.rootFolder = s;
    });
  }


  folderClicked($event) {
    this.selectedFolder = $event;
    console.log(this.selectedFolder);
  }


  fileClicked(file: DocumentFile) {
    this.fileLoading = true;
    this.fileService.getFile(file.id).then((s) => this.convertFile(s));
  }

  private convertFile(file: DocumentFile) {
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

  /*::::::::: Fullscreen :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/

  toggleFullscreen() {
    this.fullscreen = !this.fullscreen;
    setTimeout(() => { this.handleResize(); }, 100);
  }
  ff() {
    const element = <any>document.getElementById('f');

    if (element.requestFullScreen) {
      element.requestFullScreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullScreen) {
      element.webkitRequestFullScreen();
    }
  }

  /*::::::::: PDF ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::*/

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
    console.log(this.rootFolder.folder);
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
