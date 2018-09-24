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
import {OAuthService} from 'angular-oauth2-oidc';
import {QRLoginEnum} from '../components/login/login.component';
import {Subject} from 'rxjs/Subject';
import {environment} from '../../environments/environment';
import {AppConfig} from "../app.config";

@Injectable()
export class AuthService {

  userName: string;
  password: string;
  userProfile: object;
  loginState = false;

  private protocol;
  private hostname;
  private url;

  private loginCorrectSubject = new Subject<any>();


  constructor(private oauthService: OAuthService) {
    this.url = AppConfig.getURL(AppConfig.settings.services.authService);


    this.oauthService.clientId = 'ng-app1';

    this.oauthService.scope = 'openid profile email';
    this.oauthService.issuer = this.url + '/auth/realms/master';

    this.oauthService.showDebugInformation = true;
    this.oauthService.oidc = false;
    this.oauthService.requireHttps = AppConfig.settings.services.authService.requireHttps;

     this.oauthService.loadDiscoveryDocument(this.url +  '/auth/realms/master/.well-known/openid-configuration')
      .then(() => {
        this.oauthService
          .events
          .filter(e => e.type === 'token_expires')
          .subscribe(() => {
            console.log('REFRESH TOKEN');
            this.oauthService.refreshToken();
          });
      });
    console.log(this.oauthService.events);

  }
  getAccessToken() {
    return this.oauthService.getAccessToken();
  }

  getUserInfos() {
    return this.oauthService.loadUserProfile();
  }

  loginWithPassword(userName: string, password: string) {
    this
      .oauthService
      .fetchTokenUsingPasswordFlowAndLoadUserProfile(userName, password)
      .then(() => {
        console.log('successfully logged in');
        this.loginState = true;
        this.sendLoginState(true);

      })
      .catch((err) => {
        console.error('error logging in', err);
        this.loginState = false;
        this.sendLoginState(false);
      });
  }
  oa() {
    return this.oauthService;
  }

  logout() {
    this.oauthService.logOut(true);
    this.loginState = false;
    this.sendLoginState(false);
  }

  sendLoginState(loginState: boolean) {
    this.loginCorrectSubject.next({ loginState: loginState });
  }

  getLoginState() {
    const x = this.oauthService.hasValidAccessToken();
    console.log('Accesstoken valid: ', x);
    console.log('Accesstoken exp: ', new Date(this.oauthService.getAccessTokenExpiration()));
    return x;
  }

  subscribeLoginState() {
    return this.loginCorrectSubject.asObservable();
  }
}
