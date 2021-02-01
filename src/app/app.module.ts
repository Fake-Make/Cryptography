import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { ChartsModule } from 'ng2-charts';

import { MaterialModule } from '@external/material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavMenuComponent } from '@components/nav-menu/nav-menu.component';
import { AboutComponent } from '@components/about/about.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import { Work1Component } from '@works/1/work1.component';
import { Work2Component } from '@works/2/work2.component';
import { Work3Component } from '@works/3/work3.component';
import { Work4Component } from '@works/4/work4.component';
import { Work5Component } from '@works/5/work5.component';
import { Work6Component } from '@works/6/work6.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    NavMenuComponent,
    NotFoundComponent,
    Work1Component,
    Work2Component,
    Work3Component,
    Work4Component,
    Work5Component,
    Work6Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ChartsModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
