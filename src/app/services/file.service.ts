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

import { Injectable } from '@angular/core';
import { DocumentFile} from '../models/DocumentFile';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';
import { DocumentFolder } from '../models/DocumentFolder';
import { environment } from '../../environments/environment';
import {HttpClient} from "@angular/common/http";
import {AppConfig} from "../app.config";

@Injectable()
export class FileService {

  //private url = 'https://localhost:4202/duradocument/duramentum/document/';
  private protocol;
  private hostname;
  private port;
  private url;

  constructor(private http2: HttpClient, private http: Http) {
    this.url = AppConfig.getURL(AppConfig.settings.services.fileService);
  }
  
  getStoredFiles(): Promise<DocumentFolder> {
    return null;
  }

  getRoot(): Promise<DocumentFolder> {
    return this.http.get(this.url + 'folder/root')
      .toPromise()
      .then(response => response.json() as DocumentFolder)
      .catch(this.handleError);
  }

  getToolDocumentFolder(toolName: string) {
    let url = `${this.url}search/${toolName}`;
    url = url.replace(' ', '%20');
    return this.http2.get(url);
  }

  getFile(id: string) {
// get file from server
    let url = `${this.url}file/${id}/content`;
    url = url.replace(' ', '%20');
    console.log(url);
    return this.http.get(url)
      .toPromise()
      .then(response => response.json() as DocumentFile)
      .catch(this.handleError);

  }

  private handleError(error: any): Promise<any> {
    //console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}

