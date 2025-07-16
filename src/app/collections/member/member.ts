import { Component, ElementRef, HostListener, inject, Input, OnInit, output } from '@angular/core';
import { CollectionsService } from '../service';

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
export class Member implements OnInit {
  @Input({ required: true }) public word!: string;
  public selectEvent = output<MemberSelectEvent>();

  private element = inject(ElementRef);
  private collections = inject(CollectionsService);

  ngOnInit(): void {
    this.collections.clearSelectionEvent.subscribe(() => {
      this.element.nativeElement.classList.remove("selected");
    });
  }

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
