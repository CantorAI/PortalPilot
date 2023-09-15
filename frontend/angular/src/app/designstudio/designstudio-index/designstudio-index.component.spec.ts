import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DesignstudioIndexComponent} from './designstudio-index.component';

describe('DesignstudioIndexComponent', () => {
  let component: DesignstudioIndexComponent;
  let fixture: ComponentFixture<DesignstudioIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignstudioIndexComponent]
    });
    fixture = TestBed.createComponent(DesignstudioIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
