import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudboardOpenComponent } from './cloudboard-open.component';

describe('CloudboardOpenComponent', () => {
  let component: CloudboardOpenComponent;
  let fixture: ComponentFixture<CloudboardOpenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudboardOpenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudboardOpenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
