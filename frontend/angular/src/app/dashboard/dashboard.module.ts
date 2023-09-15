import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {DashboardIndexComponent} from './dashboard-index/dashboard-index.component';
import {DashboardMenuComponent} from './dashboard-menu/dashboard-menu.component';

const routes: Routes = [
  {
    path: '', component: DashboardIndexComponent,
    children: [
      {
        path: 'node-map',
        loadChildren: () => import('./node-map/node-map.module').then(m => m.NodeMapModule)
      },
      {
        path: 'metrics',
        loadChildren: () => import('./metrics/metrics.module').then(m => m.MetricsModule)
      }]
  }
];

@NgModule({
  declarations: [
    DashboardIndexComponent,
    DashboardMenuComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class DashboardModule {
}
