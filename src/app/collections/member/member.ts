import { Component, HostListener, Input, output } from '@angular/core';

export interface MemberSelectEvent {
  text: string;
  toggleSelect: () => void;
}

@Component({
  selector: 'collections-member',
  imports: [],
  templateUrl: './member.html',
  styleUrl: './member.css'
})
export class Member {
  @Input({ required: true }) public word!: string;
  public selectEvent = output<MemberSelectEvent>();

  @HostListener("click", ["$event.target"])
  onSelect(elem: EventTarget|null) {
    const event = {
      text: this.word,
      toggleSelect: () => {
        if (elem != null)
          (elem as Element).classList.toggle("selected");
      }
    };
    this.selectEvent.emit(event);
  }
}
