import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CSMain } from './c-s-main';

describe('CSMain', () => {
  let component: CSMain;
  let fixture: ComponentFixture<CSMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CSMain],
    }).compileComponents();

    fixture = TestBed.createComponent(CSMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
