import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { Modal } from '../modal/modal';
import { CollectionsGroup, CollectionsService } from './service';
import { Member } from './member/member';
import { resetSeed, shuffle } from '../../utils/random';
import { Group } from "./group/group";
import { Toast } from "../toast/toast";

const MAX_GROUPS = 5;

@Component({
  selector: 'game-collections',
  imports: [Icon, Modal, Member, Group, Toast],
  templateUrl: './collections.html',
  styleUrl: './collections.css'
})
export class Collections implements OnInit {
  protected LOADER = new Array(MAX_GROUPS * 4);

  public loaded = signal(false);
  protected lives = signal(0);
  protected grid = signal([] as string[]);
  protected gridSelected = signal([] as string[]);
  protected foundGroups = signal(CollectionsService.generateGroupArray());
  private gameFinished = false;
  protected invalidAnimation = signal(false);

  protected showWinModal = signal(false);
  protected showLossModal = signal(false);
  protected showInfoModal = signal(false);
  protected showOneAwayToast = signal(false);

  protected collections = inject(CollectionsService);

  ngOnInit() {
    this.lives.set(this.collections.getLives(MAX_GROUPS));
    if (this.lives() <= 0) {
      this.gameFinished = true;
      this.lives.set(0);
      setTimeout(() => {
        this.showLossModal.set(true);
      }, 2000);
    }
    else if (this.foundGroups().length == MAX_GROUPS) {
      this.gameFinished = true;
      setTimeout(() => {
        this.showWinModal.set(true);
      }, 2000);
    }

    // Reset RNG seed
    resetSeed();

    this.showInfoModal.set(!this.collections.hasPlayedBefore());

    this.collections.fetchDailyAnswer()
      .subscribe(_ => {
        const members = [];
        for (const group of this.collections.answer()) {
          if (!this.foundGroups().some(g => g.group == group.group))
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
    shuffle(members);
    this.grid.set(members);
  }

  selectMember(word: string) {
    if (this.gameFinished)
      return;

    // Remove one away toast when next selecting member
    this.showOneAwayToast.set(false);

    const selected = this.gridSelected();
    const selectedIndex = selected.findIndex(s => s == word);

    // If already selected, simply deselect
    if (selectedIndex != -1) {
      selected.splice(selectedIndex, 1);
    }
    // Otherwise, select if within selection limit
    else if (selected.length < 4) {
      selected.push(word);
    }

    this.gridSelected.set(selected);
  }

  clearSelection() {
    if (this.gameFinished)
      return;

    this.gridSelected.set([]);
  }

  submit() {
    if (this.gameFinished)
      return;

    const members = this.gridSelected();
    const groups = this.foundGroups();
    for (const group of this.collections.answer()) {
      if (group.members.every(member => members.includes(member))) {
        // Found this group

        setTimeout(() => {
          groups.push(group);
          this.foundGroups.set(groups);

          members.forEach(member => {
            const i = this.grid().indexOf(member);
            this.grid().splice(i, 1);
          });

          this.clearSelection();
          this.collections.saveGroups(groups, this.lives());

          if (groups.length == MAX_GROUPS) {
            this.gameFinished = true;
            this.collections.saveWin();
            setTimeout(() => {
              this.showWinModal.set(true);
            }, 1000);
          }
        }, 200);

        return;
      }
    }

    // Did not find any groups

    const newLives = this.lives() - 1;
    this.collections.saveGroups(groups, Math.max(newLives, 0));
    this.lives.set(newLives);
    this.invalidAnimation.set(true);
    setTimeout(() => this.invalidAnimation.set(false), 1000);

    if (newLives <= 0) {
      this.gameFinished = true;
      this.collections.saveLoss();
      setTimeout(() => {
        this.showLossModal.set(true);
      }, 1000);
      return;
    }

    // Check for one away
    for (const group of this.collections.answer()) {
      const matchingMembers = group.members.filter(m => members.includes(m));
      if (matchingMembers.length == 3) {
        // Is one away
        // Display toast until next selection
        this.showOneAwayToast.set(true);
      }
    }
  }

  getFoundGroupIndex(group: CollectionsGroup) {
    return this.collections.answer().findIndex(g => g.group == group.group);
  }
}
