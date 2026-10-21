import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CSettingsLayout } from './c-settings-layout';

describe('CSettingsLayout', () => {
  let component: CSettingsLayout;
  let fixture: ComponentFixture<CSettingsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CSettingsLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(CSettingsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
