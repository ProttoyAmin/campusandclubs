import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UPrivacy } from './u-privacy';

describe('UPrivacy', () => {
  let component: UPrivacy;
  let fixture: ComponentFixture<UPrivacy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UPrivacy],
    }).compileComponents();

    fixture = TestBed.createComponent(UPrivacy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
