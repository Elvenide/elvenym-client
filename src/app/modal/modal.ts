import { Component, Input, output, signal } from '@angular/core';
import { Icon } from "../icon/icon";

@Component({
  selector: 'modal',
  imports: [Icon],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class Modal {
  @Input({ required: true }) public open!: boolean;
  protected startClosing = signal(false);
  public closeEvent = output<void>();

  public close() {
    this.startClosing.set(true);
    setTimeout(() => {
      this.open = false;
      this.startClosing.set(false);
      this.closeEvent.emit();
    }, 500);
  }
}
