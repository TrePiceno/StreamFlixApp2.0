import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    expect(component).toBeTruthy();
    
  });

  it('should emit confirmed event with true when onConfirm is called', () => {

    spyOn(component.confirmed, 'emit');
    component.onConfirm();

    expect(component.confirmed.emit).toHaveBeenCalled();
    expect(component.confirmed.emit).toHaveBeenCalledTimes(1);
    expect(component.confirmed.emit).toHaveBeenCalledWith(true);

  });

  it('should emit cancelled event when onCancel is called', () => {

    spyOn(component.cancelled, 'emit');
    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
    expect(component.cancelled.emit).toHaveBeenCalledTimes(1);
    expect(component.cancelled.emit).toHaveBeenCalledWith();

  });
    
});
