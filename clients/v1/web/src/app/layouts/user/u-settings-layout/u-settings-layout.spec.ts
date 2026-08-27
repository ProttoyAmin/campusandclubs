import { ComponentFixture, TestBed } from '@angular/core/testing';
import { USettingsLayout } from './u-settings-layout';

describe('USettingsLayout', () => {
  let component: USettingsLayout;
  let fixture: ComponentFixture<USettingsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [USettingsLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(USettingsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
