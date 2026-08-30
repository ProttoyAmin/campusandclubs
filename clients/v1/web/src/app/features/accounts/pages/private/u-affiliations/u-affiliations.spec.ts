import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UAffiliations } from './u-affiliations';

describe('UAffiliations', () => {
  let component: UAffiliations;
  let fixture: ComponentFixture<UAffiliations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UAffiliations],
    }).compileComponents();

    fixture = TestBed.createComponent(UAffiliations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
