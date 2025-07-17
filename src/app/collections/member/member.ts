import { Component, HostListener, Input, output } from '@angular/core';
@Component({
  selector: 'collections-member',
  imports: [],
  templateUrl: './member.html',
  styleUrl: './member.css'
})
export class Member {
  @Input({ required: true }) public word!: string;
  public selectEvent = output<string>();

  @HostListener("click")
  onSelect() {
    this.selectEvent.emit(this.word);
  }
}
