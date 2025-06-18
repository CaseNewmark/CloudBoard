import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudboardComponent } from './cloudboard.component';

describe('CloudboardComponent', () => {
  let component: CloudboardComponent;
  let fixture: ComponentFixture<CloudboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
