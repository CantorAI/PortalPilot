import {Component} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-designstudio-list-panel',
  templateUrl: './designstudio-list-panel.component.html',
  styleUrls: ['./designstudio-list-panel.component.scss'],
  providers: []
})
export class DesignstudioListPanelComponent {
  public createInputVisible = false;

  public createName: any;

  constructor(private router: Router) {
  }

  public onCreateClick(): void {
    this.createInputVisible = true;
  }

  public onCreateOkClick(): void {
    this.createInputVisible = false;
    this.router.navigate(['designstudio/design']);
  }
}
