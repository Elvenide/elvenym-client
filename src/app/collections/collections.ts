import { Component, inject, OnInit, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { Modal } from '../modal/modal';
import { CollectionsService } from './service';
import { Member, MemberSelectEvent } from './member/member';

const MAX_GROUPS = 5;

@Component({
  selector: 'game-collections',
  imports: [Icon, Modal, Member],
  templateUrl: './collections.html',
  styleUrl: './collections.css'
})
export class Collections implements OnInit {
  protected LOADER = new Array(MAX_GROUPS * 4);

  public loaded = signal(false);
  protected lives = signal(0);
  protected grid = signal([] as string[]);
  protected gridSelected = signal([] as string[]);
  protected foundGroups = signal(CollectionsService.generateGroupArray(MAX_GROUPS));
  private gameFinished = false;

  protected showWinModal = signal(false);
  protected showLossModal = signal(false);
  protected showInfoModal = signal(false);

  protected collections = inject(CollectionsService);

  ngOnInit() {
    this.lives.set(this.collections.getLives(MAX_GROUPS));
    if (this.lives() <= 0) {
      this.gameFinished = true;
      this.lives.set(0);
      setTimeout(() => {
        this.showLossModal.set(true);
      }, 1000);
    }

    // TODO re-enable when not annoying
    // this.showInfoModal.set(!this.collections.hasPlayedBefore());

    this.collections.fetchDailyAnswer()
      .subscribe(_ => {
        const members = [];
        for (const group of this.collections.answer()) {
          members.push(...group.members);
        }
        this.shuffle(members);

        this.loaded.set(true);
        console.log("Fetched daily Collections data.");
      });
  }

  enumerate(members: string[]) {
    const output = [];
    let row = [];
    for (let i = 0; i < members.length; i++) {
      if (i % 4 == 0) {
        if (row.length != 0)
          output.push(row);
        row = [];
      }

      row.push(members[i]);
    }

    if (row.length != 0)
      output.push(row);
    return output;
  }

  shuffle(members?: string[]) {
    if (this.gameFinished)
      return;
    
    members = members ?? this.grid();
    this.grid.set(members);
  }

  selectMember(event: MemberSelectEvent) {
    if (this.gameFinished)
      return;

    const selected = this.gridSelected();
    const selectedIndex = selected.findIndex(s => s == event.text);

    // If already selected, simply deselect
    if (selectedIndex != -1) {
      event.toggleSelect();
      selected.splice(selectedIndex, 1);
    }
    // Otherwise, select if within selection limit
    else if (selected.length < 4) {
      event.toggleSelect();
      selected.push(event.text);
    }

    this.gridSelected.set(selected);
  }
}
