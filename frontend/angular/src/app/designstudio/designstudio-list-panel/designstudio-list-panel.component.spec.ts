import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DesignstudioListPanelComponent} from './designstudio-list-panel.component';

describe('DesignstudioListPanelComponent', () => {
  let component: DesignstudioListPanelComponent;
  let fixture: ComponentFixture<DesignstudioListPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignstudioListPanelComponent]
    });
    fixture = TestBed.createComponent(DesignstudioListPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
