import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloudboardListComponent } from './cloudboard-list.component';

describe('CloudboardListComponent', () => {
  let component: CloudboardListComponent;
  let fixture: ComponentFixture<CloudboardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CloudboardListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CloudboardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
