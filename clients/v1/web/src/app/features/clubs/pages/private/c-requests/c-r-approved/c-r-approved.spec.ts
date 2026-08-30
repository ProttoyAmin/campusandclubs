import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CRApproved } from './c-r-approved';

describe('CRApproved', () => {
  let component: CRApproved;
  let fixture: ComponentFixture<CRApproved>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRApproved],
    }).compileComponents();

    fixture = TestBed.createComponent(CRApproved);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
