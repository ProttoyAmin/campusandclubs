import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { HlmDialogImports } from '@/components/ui/dialog/src';
import type { BrnDialogState } from '@spartan-ng/brain/dialog';

@Component({
  imports: [HlmDialogImports],
  standalone: true,
  selector: 'app-dialog',
  styleUrl: './app-dialog.css',
  templateUrl: './app-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppDialog {
  @Input() title?: string;
  @Input() description?: string;
  @Input() open: boolean = false;
  @Output() openChange = new EventEmitter<boolean>()

  onStateChange(state: BrnDialogState) {
    this.openChange.emit(state === 'open')
  }
}
