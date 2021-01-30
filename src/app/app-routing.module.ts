import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from '@components/about/about.component';
import { NotFoundComponent } from '@components/not-found/not-found.component';
import { Work1Component } from '@works/1/work1.component';
import { Work2Component } from '@works/2/work2.component';
import { Work3Component } from '@works/3/work3.component';
import { Work4Component } from '@works/4/work4.component';
import { Work5Component } from '@works/5/work5.component';
import { Work6Component } from '@works/6/work6.component';

const routes: Routes = [
  {path: "", component: AboutComponent},
  {path: "works/1", component: Work1Component},
  {path: "works/2", component: Work2Component},
  {path: "works/3", component: Work3Component},
  {path: "works/4", component: Work4Component},
  {path: "works/5", component: Work5Component},
  {path: "works/6", component: Work6Component},
  {path: "**", component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
