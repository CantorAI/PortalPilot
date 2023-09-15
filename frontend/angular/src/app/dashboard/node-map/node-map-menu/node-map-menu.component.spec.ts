import {ComponentFixture, TestBed} from '@angular/core/testing';

import {NodeMapMenuComponent} from './node-map-menu.component';

describe('NodeMapMenuComponent', () => {
  let component: NodeMapMenuComponent;
  let fixture: ComponentFixture<NodeMapMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NodeMapMenuComponent]
    });
    fixture = TestBed.createComponent(NodeMapMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
