import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppAlertDialog } from './app-alert-dialog';

describe('AppAlertDialog', () => {
  let component: AppAlertDialog;
  let fixture: ComponentFixture<AppAlertDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppAlertDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AppAlertDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
