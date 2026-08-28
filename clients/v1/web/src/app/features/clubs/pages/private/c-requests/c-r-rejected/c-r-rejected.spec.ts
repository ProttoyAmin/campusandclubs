import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CRRejected } from './c-r-rejected';

describe('CRRejected', () => {
  let component: CRRejected;
  let fixture: ComponentFixture<CRRejected>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CRRejected],
    }).compileComponents();

    fixture = TestBed.createComponent(CRRejected);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
