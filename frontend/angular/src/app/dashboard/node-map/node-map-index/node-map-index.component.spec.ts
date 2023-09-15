import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NodeMapIndexComponent} from './node-map-index.component';

describe('NodeMapIndexComponent', () => {
  let component: NodeMapIndexComponent;
  let fixture: ComponentFixture<NodeMapIndexComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NodeMapIndexComponent]
    });
    fixture = TestBed.createComponent(NodeMapIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
