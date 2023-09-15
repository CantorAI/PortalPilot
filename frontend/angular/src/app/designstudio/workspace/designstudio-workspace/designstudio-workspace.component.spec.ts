import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DesignstudioWorkspaceComponent} from './designstudio-workspace.component';

describe('DesignstudioWorkspaceComponent', () => {
  let component: DesignstudioWorkspaceComponent;
  let fixture: ComponentFixture<DesignstudioWorkspaceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignstudioWorkspaceComponent]
    });
    fixture = TestBed.createComponent(DesignstudioWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
