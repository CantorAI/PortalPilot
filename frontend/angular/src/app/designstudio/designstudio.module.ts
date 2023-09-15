import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DesignstudioIndexComponent} from './designstudio-index/designstudio-index.component';
import {RouterModule, Routes} from "@angular/router";
import {DesignstudioListPanelComponent} from './designstudio-list-panel/designstudio-list-panel.component';
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {FormsModule} from "@angular/forms";
import {DesignstudioToolbarPanelComponent} from './workspace/designstudio-toolbar-panel/designstudio-toolbar-panel.component';
import {DesignstudioWorkspaceComponent} from './workspace/designstudio-workspace/designstudio-workspace.component';
import { DesignstudioCanvasPanelComponent } from './workspace/designstudio-canvas-panel/designstudio-canvas-panel.component';

const routes: Routes = [
  {
    path: '', component: DesignstudioIndexComponent,
    children: [
      {
        path: 'list', component: DesignstudioListPanelComponent,
      },
      {
        path: 'design', component: DesignstudioWorkspaceComponent,
      },
      {
        path: '', redirectTo: "list", pathMatch: "full"
      },
    ]
  }

];


@NgModule({
  declarations: [
    DesignstudioIndexComponent,
    DesignstudioListPanelComponent,
    DesignstudioToolbarPanelComponent,
    DesignstudioWorkspaceComponent,
    DesignstudioCanvasPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ConfirmDialogModule,
    RouterModule.forChild(routes),
    DialogModule,
    InputTextModule,
  ]
})

export class DesignstudioModule {
}
