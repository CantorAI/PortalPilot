import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DesignstudioToolbarPanelComponent} from './designstudio-toolbar-panel.component';

describe('DesignstudioToolbarPanelComponent', () => {
  let component: DesignstudioToolbarPanelComponent;
  let fixture: ComponentFixture<DesignstudioToolbarPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignstudioToolbarPanelComponent]
    });
    fixture = TestBed.createComponent(DesignstudioToolbarPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
