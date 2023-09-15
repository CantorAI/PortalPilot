import {Component} from '@angular/core';

@Component({
  selector: 'app-designstudio-toolbar-panel',
  templateUrl: './designstudio-toolbar-panel.component.html',
  styleUrls: ['./designstudio-toolbar-panel.component.scss']
})
export class DesignstudioToolbarPanelComponent {
  public toolSets = [
    {label: "Node"},
    {label: "Dataset"},
    {label: "Fermat"},
    {label: "Tee"},
    {label: "Sink"},
    {label: "Mux"},
  ]
}
