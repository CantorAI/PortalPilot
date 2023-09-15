import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MetricsIndexComponent} from './metrics-index.component';

describe('MetricsIndexComponent', () => {
  let component: MetricsIndexComponent;
  let fixture: ComponentFixture<MetricsIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MetricsIndexComponent]
    });
    fixture = TestBed.createComponent(MetricsIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
