import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CRMain } from './c-r-main';

describe('CRMain', () => {
  let component: CRMain;
  let fixture: ComponentFixture<CRMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRMain],
    }).compileComponents();

    fixture = TestBed.createComponent(CRMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
