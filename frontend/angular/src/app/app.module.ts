import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DropdownModule} from "primeng/dropdown";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {SiderMenuComponent} from './sider-menu/sider-menu.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {ToolBarComponent} from './tool-bar/tool-bar.component';
import {MenubarModule} from "primeng/menubar";
import {MenuModule} from "primeng/menu";

@NgModule({
  declarations: [
    AppComponent,
    SiderMenuComponent,
    ToolBarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DropdownModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    MenubarModule,
    MenuModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
}
