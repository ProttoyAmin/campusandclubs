import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubLayout } from './club-layout';

describe('ClubLayout', () => {
  let component: ClubLayout;
  let fixture: ComponentFixture<ClubLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
