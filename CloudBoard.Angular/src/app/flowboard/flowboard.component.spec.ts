import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowboardComponent } from './flowboard.component';

describe('FlowboardComponent', () => {
  let component: FlowboardComponent;
  let fixture: ComponentFixture<FlowboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
