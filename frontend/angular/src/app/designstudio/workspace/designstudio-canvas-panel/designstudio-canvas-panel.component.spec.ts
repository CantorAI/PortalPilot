import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignstudioCanvasPanelComponent } from './designstudio-canvas-panel.component';

describe('DesignstudioCanvasPanelComponent', () => {
  let component: DesignstudioCanvasPanelComponent;
  let fixture: ComponentFixture<DesignstudioCanvasPanelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignstudioCanvasPanelComponent]
    });
    fixture = TestBed.createComponent(DesignstudioCanvasPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
