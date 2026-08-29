import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppDropdownMenu } from './dropdown-menu';

describe('DropdownMenu', () => {
  let component: AppDropdownMenu;
  let fixture: ComponentFixture<AppDropdownMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDropdownMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(AppDropdownMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
