import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MetricsIndexComponent} from './metrics-index/metrics-index.component';
import {MetricsMenuComponent} from './metrics-menu/metrics-menu.component';
import {MetricsOverviewComponent} from './metrics-overview/metrics-overview.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '', component: MetricsIndexComponent,
    children: [
      {path: 'overview', component: MetricsOverviewComponent},
    ]
  }
];

@NgModule({
  declarations: [
    MetricsIndexComponent,
    MetricsMenuComponent,
    MetricsOverviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class MetricsModule {
}
