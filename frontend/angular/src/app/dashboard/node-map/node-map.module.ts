import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NodeMapMenuComponent} from './node-map-menu/node-map-menu.component';
import {RouterModule, Routes} from "@angular/router";
import {NodeMapIndexComponent} from './node-map-index/node-map-index.component';
import {NodeMapDesignComponent} from './node-map-design/node-map-design.component';

const routes: Routes = [
  {
    path: '', component: NodeMapIndexComponent,
    children: [
      {path: 'design', component: NodeMapDesignComponent},
    ]
  }
];

@NgModule({
  declarations: [
    NodeMapMenuComponent,
    NodeMapIndexComponent,
    NodeMapDesignComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class NodeMapModule {
}
