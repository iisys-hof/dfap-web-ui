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

import {Injectable, NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRouteSnapshot, Resolve, Router, RouterModule, RouterStateSnapshot, Routes} from '@angular/router';
import { LoginComponent} from '../../components/login/login.component';
import { DashboardComponent } from '../../components/dashboard/dashboard.component';
import { MachinePreparationComponent } from '../../components/machine-preparation/machine-preparation.component';
import { LogoutComponent } from '../../components/logout/logout.component';
import { OrderDataComponent } from '../../components/order-data/order-data.component';
import { ToolSettingComponent } from '../../components/tool-setting/tool-setting.component';
import {FeedbackComponent} from '../../components/feedback/feedback.component';
import {
  CanActivateAdminViaAuthGuardService,
  CanActivateViaAuthGuardService
} from "../../services/can-activate-via-auth-guard.service";
import {AuthService} from "../../services/auth.service";
import {Observable} from "rxjs/Observable";
import {QualityAssuranceComponent} from "../../components/quality-assurance/quality-assurance.component";
import {OrderOverviewComponent} from "../../components/order-overview/order-overview.component";
import {ToolDataComponent} from "../../components/tool-data/tool-data.component";
import {FbGeneratorComponent} from "../../components/admin/fb-generator/fb-generator.component";
import {QaInputMaskComponent} from "../../components/admin/qa-input-mask/qa-input-mask.component";
import {ToolServiceComponent} from "../../components/admin/tool-service/tool-service.component";
import {PrinterComponent} from "../../components/admin/printer/printer.component";
import {MachinePrintersComponent} from "../../components/admin/machine-printers/machine-printers.component";
import {EditFeedbackComponent} from "../../components/admin/edit-feedback/edit-feedback.component";
import {StartComponent} from "../../components/admin/start/start.component";


@Injectable()
 export class IsLoggedIn implements Resolve<boolean> {

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.getLoginState()) {
      this.router.navigateByUrl('/orders');
    }
    return true;
  }
  constructor(
    private router: Router,
    private authService: AuthService) {
  }


}




const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',  component: LoginComponent, resolve: [IsLoggedIn] },
  { path: 'adminlogin',  component: LoginComponent, resolve: [IsLoggedIn] },
  { path: 'admin/dashboard',  component: DashboardComponent, canActivate: [CanActivateViaAuthGuardService] },
  { path: 'preparation',  component: MachinePreparationComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'orders',  component: OrderOverviewComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'orderdata',  component: OrderDataComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'orderdata/:id',  component: OrderDataComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'toolsetting',  component: ToolSettingComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'feedback',  component: FeedbackComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'qs',  component: QualityAssuranceComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'logout',  component: LogoutComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'tooldata',  component: ToolDataComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'packaging',  component: ToolDataComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/xls',  component: FbGeneratorComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/qa',  component: QaInputMaskComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/wz',  component: ToolServiceComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/printers',  component: PrinterComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/mp',  component: MachinePrintersComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/ef',  component: EditFeedbackComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/ef/:id',  component: EditFeedbackComponent, canActivate: [CanActivateViaAuthGuardService]  },
  { path: 'admin/start',  component: StartComponent, canActivate: [CanActivateViaAuthGuardService]  },
];


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {useHash: true})
    //RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ],
  declarations: [],
  providers: [IsLoggedIn, CanActivateViaAuthGuardService, CanActivateAdminViaAuthGuardService]
})
export class RoutingModule { }


