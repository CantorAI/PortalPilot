import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MetricsMenuComponent} from './metrics-menu.component';

describe('MetricsMenuComponent', () => {
  let component: MetricsMenuComponent;
  let fixture: ComponentFixture<MetricsMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MetricsMenuComponent]
    });
    fixture = TestBed.createComponent(MetricsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
