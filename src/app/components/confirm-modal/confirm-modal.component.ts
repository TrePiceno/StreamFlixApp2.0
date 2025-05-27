import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.css',
})
export class ConfirmModalComponent {

  @Input() itemToDelete: Item | null = null;
  @Output() confirmed = new EventEmitter<boolean>();
  @Output() cancelled = new EventEmitter<void>();

  constructor() {}

  onConfirm(): void {
    this.confirmed.emit(true);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
  
}
