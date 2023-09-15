import {Component, OnInit} from '@angular/core';
import {MenuItem} from "primeng/api";

@Component({
  selector: 'app-tool-bar',
  templateUrl: './tool-bar.component.html',
  styleUrls: ['./tool-bar.component.scss']
})
export class ToolBarComponent implements OnInit {
  items: MenuItem[] | undefined;

  userMenus = [{
    label: 'Theme',
    items: [
      {
        label: 'Dark',
        icon: 'pi pi-moon',
        command: () => {
        }
      },
      {
        label: 'Light',
        icon: 'pi pi-sun',
        command: () => {
        }
      }
    ]
  }]

  ngOnInit(): void {
    this.items = [
      {
        label: 'Project',
        icon: 'pi pi-fw pi-file',
        items: [
          {
            label: 'New',
            icon: 'pi pi-fw pi-plus',
            items: []
          },
          {
            label: 'Open',
            icon: 'pi pi-fw pi-folder-open'
          }
        ]
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
        items: []
      },
      {
        label: 'View',
        icon: 'pi pi-fw pi-user',
        items: []
      },
      {
        label: 'Run',
        icon: 'pi pi-fw pi-caret-right',
        items: []
      },
    ];
  }

}
