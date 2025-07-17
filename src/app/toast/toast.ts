import { Component, Input } from '@angular/core';

@Component({
  selector: 'toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrl: './toast.css'
})
export class Toast {
  @Input() public show = false;
}
