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

import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UtiliesService} from '../../services/utilies.service';
import {AuthService} from '../../services/auth.service';
import {Subscription} from 'rxjs/Subscription';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  @ViewChild('displayTmpl') displayTmpl: TemplateRef<any>;


  public qrLoginEnum = QRLoginEnum;
  public qrLogin = QRLoginEnum.QRAttempt;
  public loginId;
  public loginPw;
  public showImage = true;

  private loginState = false;
  private loginCorrect: Subscription;
  private user;

  constructor(private route: ActivatedRoute, private router: Router, private utilityservice: UtiliesService, private authService: AuthService) {
    this.loginState = this.authService.getLoginState();
    this.loginCorrect = this.authService.subscribeLoginState().subscribe(message => {
      this.loginState = message['loginState'];
      console.log("fddddddsfg", this.loginState);
      this.checkLoginState();

      this.authService.oa().loadDiscoveryDocumentAndTryLogin().then(() => {
        this.authService.getUserInfos().then((x) => {
          console.log('USERINFO, ', x);
          this.user = x;
          this.loginState = message['loginState'];
          console.log("fddddddsfg", this.loginState);
          this.checkLoginState();

        });
      });
    });
  }

  ngOnInit() {
    setInterval(() => { this.clickit(); }, 1000);
    if (this.authService.getLoginState()) {
      this.router.navigateByUrl('/preperation');
    }
    if (document.location.href.includes('adminlogin')) {
      this.qrLogin = QRLoginEnum.AdminLogin;
    }
  }

  decodedOutput($event): void {
    this.checkQRCode($event, null);
}

  private clickit() {
    // Empty, bug in angular causes no refresh
  }

  // ATM just a predefined name. This methods should check the id.
  private checkQRCode(id, pw): void {
    console.log(id);
    console.log(pw);
    if (pw === null) {
      this.authService.loginWithPassword(id, 'Gamma159');
    } else {
      this.authService.loginWithPassword(id, pw);

    }
  }

  checkLoginState() {

    if (this.qrLogin === QRLoginEnum.PWLogin || this.qrLogin === QRLoginEnum.AdminLogin) {
      this.showImage = false;
      this.qrLogin = QRLoginEnum.QRCorrect;

      if (this.loginState) {
        this.qrLogin = QRLoginEnum.QRCorrect;
        setTimeout(() => {
          this.login();
        }, 2000);
      } else {
        this.qrLogin = QRLoginEnum.QRFail;
      }
      return;
    }
    if (this.loginState) {
      this.qrLogin = QRLoginEnum.QRCorrect;
      this.picture();
    } else {
      this.qrLogin = QRLoginEnum.QRFail;
    }

  }

  // After the qr code was recognised the last frame will stay as an image
  public picture () {
    try {
      const photo = document.getElementById('photo');
      const canvas = <HTMLCanvasElement> document.getElementsByTagName('canvas')[0];
      const data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);

      setTimeout(() => {
        this.login();
      }, 2000);
    }catch (e) {
      console.log('out of range');
    }
  }

  public login() {
    if (this.user.groups.includes('/admin')) {
      this.router.navigateByUrl('/admin/qa');
    } else {
      this.router.navigateByUrl('/orders');
    }
  }
}

export enum QRLoginEnum {
  QRAttempt,
  QRCorrect,
  QRFail,
  PWLogin,
  AdminLogin
}
