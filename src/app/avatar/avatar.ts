import { Component, Input } from '@angular/core';

@Component({
  selector: 'avatar',
  imports: [],
  templateUrl: './avatar.html',
  styleUrl: './avatar.css'
})
export class Avatar {
  @Input() public url?: string;
  @Input() public username?: string;
}
