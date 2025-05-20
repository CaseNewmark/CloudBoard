import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleNoteComponent } from './simple-note.component';

describe('SimpleNoteComponent', () => {
  let component: SimpleNoteComponent;
  let fixture: ComponentFixture<SimpleNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleNoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
