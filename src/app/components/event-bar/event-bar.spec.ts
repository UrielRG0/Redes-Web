import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventBar } from './event-bar';

describe('EventBar', () => {
  let component: EventBar;
  let fixture: ComponentFixture<EventBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
