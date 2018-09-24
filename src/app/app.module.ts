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

import { APP_INITIALIZER } from '@angular/core';
import { AppConfig } from './app.config';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpModule, JsonpModule} from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { RoutingModule } from './modules/routing/routing.module';
import { QrScannerModule } from './modules/qrscanner/dist/index';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { KeysPipe, MachinePreparationComponent } from './components/machine-preparation/machine-preparation.component';
import { FileService} from './services/file.service';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {OrderByPipe, TreeViewComponent} from './tree-view/tree-view.component';
import { LogoutComponent } from './components/logout/logout.component';
import {OrderDataComponent, TruncatePipe} from './components/order-data/order-data.component';
import { ToolSettingComponent } from './components/tool-setting/tool-setting.component';
import {DatabaseService} from './services/database.service';
import { ContenteditableDirective } from './directives/contenteditable.directive';
import { ModalInfoComponent } from './components/modal-info/modal-info.component';
import { FeedbackComponent } from './components/feedback/feedback.component';
import {UtiliesService} from './services/utilies.service';
import {HttpClientModule} from '@angular/common/http';
import {OAuthModule} from 'angular-oauth2-oidc';
import {AuthService} from './services/auth.service';
import {CanActivateViaAuthGuardService} from './services/can-activate-via-auth-guard.service';
import { QualityAssuranceComponent } from './components/quality-assurance/quality-assurance.component';
import { OrderOverviewComponent } from './components/order-overview/order-overview.component';
import { ToolDataComponent } from './components/tool-data/tool-data.component';
import { FbGeneratorComponent } from './components/admin/fb-generator/fb-generator.component';
import { QaInputMaskComponent } from './components/admin/qa-input-mask/qa-input-mask.component';
import { CalculatorComponent } from './components/utils/calculator/calculator.component';
import { ToolServiceComponent } from './components/admin/tool-service/tool-service.component';
import { AdditionalInformationInsertionComponent } from './components/utils/additional-information-insertion/additional-information-insertion.component';
import { PrinterComponent } from './components/admin/printer/printer.component';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import {WebsocketService} from './services/websocket.service';
import { MachinePrintersComponent } from './components/admin/machine-printers/machine-printers.component';
import {PrinterService} from './services/printer.service';
import { EditFeedbackComponent } from './components/admin/edit-feedback/edit-feedback.component';
import { ModalFeedbackEditComponent } from './components/utils/modal-feedback-edit/modal-feedback-edit.component';
import { StartComponent } from './components/admin/start/start.component';


export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MachinePreparationComponent,
    KeysPipe, OrderByPipe, TruncatePipe,
    TreeViewComponent,
    LogoutComponent,
    OrderDataComponent,
    ToolSettingComponent,
    ContenteditableDirective,
    ModalInfoComponent,
    FeedbackComponent,
    QualityAssuranceComponent,
    OrderOverviewComponent,
    ToolDataComponent,
    FbGeneratorComponent,
    QaInputMaskComponent,
    CalculatorComponent,
    ToolServiceComponent,
    AdditionalInformationInsertionComponent,
    PrinterComponent,
    MachinePrintersComponent,
    EditFeedbackComponent,
    ModalFeedbackEditComponent,
    StartComponent
  ],
  imports: [
    BrowserModule,
    RoutingModule,
    FormsModule,
    QrScannerModule,
    NgbModule.forRoot(),
    HttpModule,
    JsonpModule,
    HttpClientModule,
    OAuthModule.forRoot(),
    Ng2DragDropModule.forRoot()
  ],
  providers: [
    AppConfig,
    { provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [AppConfig], multi: true
    },
    FileService,
    DatabaseService,
    UtiliesService,
    AuthService,
    CanActivateViaAuthGuardService,
    WebsocketService,
    PrinterService],
  bootstrap: [AppComponent],
})
export class AppModule { }

