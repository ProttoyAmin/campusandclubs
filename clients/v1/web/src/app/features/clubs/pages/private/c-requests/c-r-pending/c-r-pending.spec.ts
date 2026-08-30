import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CRPending } from './c-r-pending';

describe('CRPending', () => {
  let component: CRPending;
  let fixture: ComponentFixture<CRPending>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRPending],
    }).compileComponents();

    fixture = TestBed.createComponent(CRPending);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
