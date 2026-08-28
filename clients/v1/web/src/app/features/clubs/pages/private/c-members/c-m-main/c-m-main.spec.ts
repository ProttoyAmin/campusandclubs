import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CMMain } from './c-m-main';

describe('CMMain', () => {
  let component: CMMain;
  let fixture: ComponentFixture<CMMain>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CMMain],
    }).compileComponents();

    fixture = TestBed.createComponent(CMMain);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
