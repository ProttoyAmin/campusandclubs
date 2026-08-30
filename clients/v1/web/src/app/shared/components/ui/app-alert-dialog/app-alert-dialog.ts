import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HlmAlertDialogImports } from '@/components/ui/alert-dialog/src';
import { BrnAlertDialogImports } from '@spartan-ng/brain/alert-dialog';

@Component({
  imports: [HlmAlertDialogImports, BrnAlertDialogImports],
  selector: 'app-alert-dialog',
  styleUrl: './app-alert-dialog.css',
  templateUrl: './app-alert-dialog.html',
})
export class AppAlertDialog {
  @Input() title?: string;
  @Input() description?: string;
  @Input() open: boolean = false;
  @Input() cancelText: string = 'Cancel';
  @Input() confirmText: string = 'Confirm';

  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() openChange = new EventEmitter<boolean>();

  onStateChanged(state: 'open' | 'closed') {
    this.openChange.emit(state === 'open');
  }

  // handleCancel() {
  //   this.cancelled();
  // }

  // handleConfirm() {
  //   this.confirmed();
  // }
}
