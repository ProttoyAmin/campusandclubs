import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClubMainLayout } from './club-main-layout';

describe('ClubMainLayout', () => {
  let component: ClubMainLayout;
  let fixture: ComponentFixture<ClubMainLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClubMainLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(ClubMainLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
