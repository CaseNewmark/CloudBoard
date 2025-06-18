import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudboardEditComponent } from './cloudboard-edit.component';

describe('CloudboardEditComponent', () => {
  let component: CloudboardEditComponent;
  let fixture: ComponentFixture<CloudboardEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudboardEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudboardEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
