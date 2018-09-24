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
import { Http, Response } from '@angular/http';
import { environment } from '../environments/environment';
import { IAppConfig } from './app-config.model';

@Injectable()
export class AppConfig {

  static settings: IAppConfig;

  static getURL(settingsObject) {
    let protocol = settingsObject.protocol;
    let host = settingsObject.host;
    let port: any = settingsObject.port;
    const path = settingsObject.path;

    protocol = protocol === '<local>' ? window.location.protocol : protocol;
    host = host === '<local>' ? window.location.hostname : host;
    port = port === '<local>' ? window.location.port : port;


    return  protocol + '://' + host + ':' + port + path;;

  }

  constructor(private http: Http) {}

  load() {
    const jsonFile = `assets/config/config.${environment.name}.json`;
    return new Promise<void>((resolve, reject) => {
      this.http.get(jsonFile).toPromise().then((response : Response) => {
        AppConfig.settings = <IAppConfig>response.json();
        resolve();
      }).catch((response: any) => {
        reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
      });
    });
  }


}
