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

import { Component, Input } from '@angular/core';
import {OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {UtiliesService} from './services/utilies.service';
import {AuthService} from './services/auth.service';
import {NavigationStart, Router} from '@angular/router';
import {DatabaseService} from './services/database.service';
import {environment} from "../environments/environment";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';

  @Input() checkboxValue: boolean;
  loginCorrect: Subscription;
  amountSubscription: Subscription;
  orderSubscription: Subscription;
  public loginState = false;
  public isAdmin = false;
  public user = new Object();


  article = "";
  orderId = -1;
  machine;
  totalQuantity;
  finishedQuantity = '0';
  private quantityOfContainer;

  public showHelp;
  public activeView;

  public containers = [];
  public containerValue;

  public containerNumberFinished;
  public showContainerView = false;
  public showCalculatorView = false;


  public menuOpen = false;


  constructor(private authService: AuthService, private router: Router, private utilityService: UtiliesService, private databaseService: DatabaseService) { }

  getOrder(orderId) {
    this.databaseService.getOrder(orderId).then(x => {
      this.quantityOfContainer = x['quantityOfContainer'];
      this.orderId = x['orderingId'];
      this.machine = x['machine']['name'];
      this.article = x['article']['name'];
      this.totalQuantity = x['totalQuantity'];
      this.finishedQuantity = x['finishedQuantity'];
      this.setupContainer();

      this.databaseService.getFeedbackEntriesForOrder(orderId).then((s) => {
        if (s.length > 0 ) {
          for (let y = 0; y < s.length; y++) {
            this.finishedQuantity += Number(s[y]['accepted']) ; // <-- Error
          }
        }
      });
    });
  }

  ngOnInit() {

    this.showHelp = false;
    this.amountSubscription = this.utilityService.subscribeMessage().subscribe(message => {
      if (message['type'] === 'amount') {
        this.finishedQuantity = message['message'];
      }
    });

    if (window.location.href.includes('/admin')) {
      this.isAdmin = true;
    }

    this.activeView = "";
    this.router.events.subscribe ( event => {
      if ( event instanceof NavigationStart ) {
        this.activeView = event['url'];
        console.log('ACTIVE VIEW', event['url']);
      }
    });

    this.loginState = this.authService.getLoginState();

    if (this.loginState) {

      this.authService.oa().loadDiscoveryDocumentAndTryLogin().then(() => {
        this.authService.getUserInfos().then((x) => {
          this.user = x;
        });
      });

    }
    this.loginCorrect = this.authService.subscribeLoginState().subscribe(message => {
      this.loginState = message['loginState'];
      if (this.loginState) {
        this.authService.getUserInfos().then((x) => {
          this.user = x;
        });
      }
    });


    this.orderSubscription = this.utilityService.subscribeMessage().subscribe(message => {
      if (message['type'] === 'activeOrder') {
        console.log(message['message']['orderingId']);
        if (message['message']['orderingId'] !== undefined) {
          this.getOrder(message['message']['orderingId']);
        } else {
          this.orderId = -1;
        }
      }
    });

    if (this.utilityService.getActiveOrder()['orderingId'] > 0) {
      console.log('Active ORDER');
      this.getOrder(this.utilityService.getActiveOrder()['orderingId']);
    }
   // this.handleResize()
   // window.addEventListener('resize', () => this.handleResize());




  }

  handleResize() {
    let h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    h += 0;
    console.log("rgreh");
    document.getElementById('menu').style.height = String(h) + 'px';
  }
  logout() {
    this.authService.logout();
    this.user = [];
    this.router.navigateByUrl('/login');
  }
  public close() {
    this.checkboxValue = false;
  }
  public check() {

    if (this.checkboxValue) {
      const x = document.getElementsByClassName('blur');
      for (let i = 0; i < x.length; i++) {

        x[i].setAttribute('style', 'transition: 0.2s filter linear;' +
          '-webkit-filter: blur(5px) !important;\n' +
          '  -moz-filter: blur(5px) !important;\n' +
          '  -o-filter: blur(5px) !important;\n' +
          '  -ms-filter: blur(5px) !important;\n' +
          '  filter: blur(5px) !important; ');
      }
    } else {
      const x = document.getElementsByClassName('blur');
      for (let i = 0; i < x.length; i++) {

        x[i].setAttribute('style', 'transition: 0.4s filter linear;' +
          '-webkit-filter: none !important;\n' +
          '  -moz-filter: none !important;\n' +
          '  -o-filter: none !important;\n' +
          '  -ms-filter: none !important;\n' +
          '  filter: none !important;');
      }
    }
  }

  public viewBack() {
    switch (this.activeView) {
      case '/orderdata': { this.activeView--; this.router.navigateByUrl('/orders'); break; }
      case '/tooldata': { this.activeView--; this.router.navigateByUrl('/orderdata'); break; }
      case '/toolsetting': { this.activeView--; this.router.navigateByUrl('/tooldata'); break; }
      case '/feedback': { this.activeView--; this.router.navigateByUrl('/toolsetting'); break; }
      case '/qs': { this.activeView--; this.router.navigateByUrl('/feedback'); break; }
    }
  }
  public viewForward() {
    switch (this.activeView) {
      case '/orders': { this.activeView++; this.router.navigateByUrl('/orderdata'); break; }
      case '/orderdata': { this.activeView++; this.router.navigateByUrl('/tooldata'); break; }
      case '/tooldata': { this.activeView++; this.router.navigateByUrl('/toolsetting'); break; }
      case '/toolsetting': { this.activeView++; this.router.navigateByUrl('/feedback'); break; }
      case '/feedback': { this.activeView++; this.router.navigateByUrl('/qs'); break; }
    }
  }

  public setupContainer() {
    this.containerNumberFinished = 0;
    this.containers = [];
    this.containerValue = '';
    for (let i = 0; i < this.quantityOfContainer; i++) {
      this.containers.push(new Container());
      this.containers[i].checked = false;
    }


    if (this.utilityService.getItem('containers' + this.orderId) != null) {
      this.containers = this.utilityService.getItem('containers' + this.orderId);
      console.log(this.containers);
    }
    if (this.utilityService.getItem('containerValue' + this.orderId) != null) {
      this.containerValue  = this.utilityService.getItem('containerValue' + this.orderId);
    }


    for (const container of this.containers) {
      if (container.checked) {
        this.containerNumberFinished++;
      }
    }
  }

  toggleContainers(c: Container) {
    if (c.checked === true) {
      c.checked = false;
    } else {
      c.checked = true;
    }
    this.utilityService.storeItem('containers' + this.orderId, this.containers);
    this.containerNumberFinished = 0;
    for (const container of this.containers) {
      if (container.checked) {
        this.containerNumberFinished++;
      }
    }
  }
  updateContainerValue() {

    console.log("UPDATE cV," , this.containerValue);
    this.utilityService.storeItem('containerValue' + this.orderId, this.containerValue);

  }

  showPackaging() {

    let path = '';
    let name =     this.utilityService.getActiveOrder().tool.name;
    const version =     this.utilityService.getActiveOrder().tool.version;
    name = name.trim();
    name = name.substr(1);
    const article = name.substr(0, 4);
    const toolthousand = name.substr(0, 1);
    path = '/packaging;p1=Verpackungsvorschrift PDF;p2=Verpackungsvorschrift ' + toolthousand + '000;p3=Artikel ' + article + ' Container PA.pdf';
    if (environment.production) {
      path = '/packaging;p1=Info-Pools;p2=Verpackungsvorschriften;p3=Fertige PDF Verpackungsvorschriften;p4=Verpackungsvorschrift PDF;p5=Verpackungsvorschrift ' + toolthousand + '000;p6=Artikel ' + article + ' Container PA.pdf';
    }
    console.log(path);
    this.router.navigateByUrl(path);
  }




  /* Set the width of the side navigation to 250px */
  openNav() {
    document.getElementById("mySidenav").style.width = "285px";
    document.getElementById("mySidenavMenu").style.opacity = "1.0";
    this.menuOpen = true;
  }

  /* Set the width of the side navigation to 0 */
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("mySidenavMenu").style.opacity = "0";
    this.menuOpen = false;
  }


  public showAdditionalElements() {

    return !this.activeView.startsWith('/admin/') && this.activeView !== '/login';
  }


}


class Container {
  public checked: boolean;
}


