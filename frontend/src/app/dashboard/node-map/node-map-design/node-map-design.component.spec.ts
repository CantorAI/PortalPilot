import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NodeMapDesignComponent} from './node-map-design.component';

describe('NodeMapDesignComponent', () => {
  let component: NodeMapDesignComponent;
  let fixture: ComponentFixture<NodeMapDesignComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NodeMapDesignComponent]
    });
    fixture = TestBed.createComponent(NodeMapDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
