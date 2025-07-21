import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Row } from './row/row';
import { Keyboard } from './keyboard/keyboard';
import { AbsurdleService } from './service';
import { Icon } from '../icon/icon';
import { Modal } from "../modal/modal";
import { UserService } from '../user-service';
import { Avatar } from '../avatar/avatar';

const MAX_GUESSES = 5;

@Component({
  selector: 'game-absurdle',
  imports: [Row, Keyboard, Icon, Modal, Avatar],
  templateUrl: './absurdle.html',
  styleUrl: './absurdle.css'
})
export class Absurdle implements OnInit {
  public loaded = signal(false);
  protected guesses: WritableSignal<[string, number][]> = signal([]);
  protected activeRow = 0;
  protected isTyping = false;
  protected isInvalid = signal(false);
  private gameFinished = false;
  protected showWinModal = signal(false);
  protected showLossModal = signal(false);
  protected showInfoModal = signal(false);

  protected absurdle = inject(AbsurdleService);
  protected user = inject(UserService);

  ngOnInit() {
    this.guesses.set(AbsurdleService.generateGuessArray(MAX_GUESSES));
    this.activeRow = this.absurdle.getActiveRow();
    if (this.activeRow >= MAX_GUESSES) {
      this.gameFinished = true;
      this.activeRow = MAX_GUESSES;
    }

    this.showInfoModal.set(!this.absurdle.hasPlayedBefore());

    this.absurdle.fetchDailyAnswer()
      .subscribe(_ => {
        this.loaded.set(true);
        console.log("Fetched daily Absurdle data.");

        if (this.activeRow >= MAX_GUESSES) {
          const maxGuess = this.guesses().at(-1)?.[0]!;
          if (maxGuess.length == 6 && maxGuess != this.absurdle.answer())
            setTimeout(() => {
              this.showLossModal.set(true);
            }, 1000);
        }
      });

    this.absurdle.keyPressEvent.subscribe(key => {
      this.onKeyPress(key);
    });

    document.addEventListener("keyup", e => {
      const key = e.key.toLowerCase();
      if (key == "enter" || key == "backspace")
        e.preventDefault();

      this.absurdle.keyPressEvent.next(key);
    });
  }

  protected onKeyPress(key: string) {
    if (this.gameFinished)
        return;
      
    const guesses = [...this.guesses()];
    this.isTyping = false;

    if (key == "enter" && guesses[this.activeRow][0].length == 6 && !this.isInvalid()) {
      // Ensure guess is valid
      if (!this.absurdle.isValidGuess(guesses[this.activeRow][0])) {
        this.isInvalid.set(true);
        setTimeout(() => this.isInvalid.set(false), 1000);
        return;
      }

      let isWin = guesses[this.activeRow][0] == this.absurdle.answer();
      
      this.activeRow++;
      this.guesses.set(guesses);
      this.absurdle.saveGuesses(guesses, this.activeRow);

      if (this.activeRow >= MAX_GUESSES || isWin) {
        this.gameFinished = true;
        this.activeRow = MAX_GUESSES;

        if (isWin)
          this.absurdle.saveWin();
        else {
          this.absurdle.saveLoss();
          setTimeout(() => {
            this.showLossModal.set(true);
          }, 1000);
        }
      }
    }

    else if (key == "backspace") {
      guesses[this.activeRow][0] = guesses[this.activeRow][0].slice(0, -1);
      this.guesses.set(guesses);
    }

    else if (key.length != 1 || key.match(/[^a-z]/))
      return;

    else if (guesses[this.activeRow][0].length < 6) {
      this.isTyping = true;
      guesses[this.activeRow][0] += key;
      this.guesses.set(guesses);
    }
  }

  protected onWin() {
    this.showWinModal.set(true);
  }

  protected getCorrectKeys() {
    const keys = new Set<string>();
    const answer = this.absurdle.answer();

    for (const [guess, row] of this.guesses()) {
      if (row == this.activeRow)
        continue;

      for (let i = 0; i < 6; i++) {
        if (guess[i] == answer[i])
          keys.add(guess[i]);
      }
    }

    return keys;
  }

  protected getMisplacedKeys() {
    const keys = new Set<string>();
    const answer = this.absurdle.answer();

    for (const [guess, row] of this.guesses()) {
      if (row == this.activeRow)
        continue;

      for (let i = 0; i < 6; i++) {
        if (guess[i] != answer[i] && answer.includes(guess[i]))
          keys.add(guess[i]);
      }
    }

    return keys;
  }

  protected getIncorrectKeys() {
    const keys = new Set<string>();
    const answer = this.absurdle.answer();

    for (const [guess, row] of this.guesses()) {
      if (row == this.activeRow)
        continue;

      for (let i = 0; i < 6; i++) {
        if (!answer.includes(guess[i]))
          keys.add(guess[i]);
      }
    }

    return keys;
  }

  protected getWinRow() {
    return this.guesses().findIndex(([guess, _i]) => guess == this.absurdle.answer()) + 1;
  }
}
