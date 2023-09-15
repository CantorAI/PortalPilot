import {CUSTOM_ELEMENTS_SCHEMA, Injector, NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
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
    MetricsOverviewComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MetricsModule {
}
