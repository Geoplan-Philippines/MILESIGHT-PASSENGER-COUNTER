import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CounterPage } from './counter-page';

describe('CounterPage', () => {
  let component: CounterPage;
  let fixture: ComponentFixture<CounterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CounterPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CounterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
