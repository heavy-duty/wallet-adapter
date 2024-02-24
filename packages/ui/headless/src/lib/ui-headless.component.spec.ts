import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UiHeadlessComponent } from './ui-headless.component';

describe('UiHeadlessComponent', () => {
  let component: UiHeadlessComponent;
  let fixture: ComponentFixture<UiHeadlessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiHeadlessComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UiHeadlessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
