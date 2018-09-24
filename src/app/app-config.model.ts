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

export interface IAppConfig {
  env: {
    name: string;
  };

  feedback: {
    allowedOutlines: Array<string>;
  };
  services: {
    authService: {
      protocol: string;
      host: string;
      port: number;
      path: string;
      requireHttps: boolean;
    };
    printerService: {
      protocol: string;
      host: string;
      port: number;
      path: string;
    };
    printerServiceVogler: {
      protocolV: string;
      hostV: string;
      portV: number;
      pathV: string;
    };
    utilityService: {
      protocol: string;
      host: string;
      port: number;
      path: string;
    };
    fileService: {
      protocol: string;
      host: string;
      port: number;
      path: string;
    };
    databaseService: {
      order: {
        protocol: string;
        host: string;
        port: number;
        path: string;
      },
      toolSetting: {
        protocol: string;
        host: string;
        port: number;
        path: string;
      },
      feedback: {
        protocol: string;
        host: string;
        port: number;
        path: string;
      }
    }
  }
}
