import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowboardOpenComponent } from './flowboard-open.component';

describe('FlowboardOpenComponent', () => {
  let component: FlowboardOpenComponent;
  let fixture: ComponentFixture<FlowboardOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowboardOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowboardOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
