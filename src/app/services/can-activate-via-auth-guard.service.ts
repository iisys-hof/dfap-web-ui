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
import {AuthService} from './auth.service';
import {ActivatedRouteSnapshot, CanActivate, Resolve, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class CanActivateViaAuthGuardService implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    //return this.authService.getLoginState();
    return true;
  }

  constructor(private authService: AuthService) {
  }
}

@Injectable()
export class CanActivateAdminViaAuthGuardService implements CanActivate {

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    console.log("CanActivateAdminViaAuthGuardService");
    if (this.authService.getLoginState()) {
      return this.authService.oa().loadDiscoveryDocumentAndTryLogin().then(() => {
        return this.authService.getUserInfos().then((x) => {
          console.log("CAWA true", x['groups'].includes('/admin'));
          return x['groups'].includes('/admin');
        });
      });
    } else {
      return false;
    }
  }

  constructor(private authService: AuthService) {

  }

}


