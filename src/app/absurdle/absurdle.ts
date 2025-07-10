import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Row } from './row/row';
import { Keyboard } from './keyboard/keyboard';
import { AbsurdleService } from './service';
import { Icon } from '../icon/icon';

const MAX_GUESSES = 5;

@Component({
  selector: 'game-absurdle',
  imports: [Row, Keyboard, Icon],
  templateUrl: './absurdle.html',
  styleUrl: './absurdle.css'
})
export class Absurdle implements OnInit {
  public loaded = signal(false);
  protected guesses: WritableSignal<[string, number][]> = signal(AbsurdleService.generateGuessArray(MAX_GUESSES));
  protected activeRow = 0;
  protected isTyping = false;
  protected isInvalid = signal(false);
  private gameFinished = false;
  protected absurdle = inject(AbsurdleService);

  ngOnInit() {
    this.absurdle.fetchDailyAnswer()
      .subscribe(_ => {
        this.loaded.set(true);
        console.log("Fetched daily Absurdle data.");
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
      if (this.activeRow >= MAX_GUESSES || isWin) {
        this.gameFinished = true;
        this.activeRow = MAX_GUESSES;
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
    alert("YOU HAVE WON!\nInsert Modal here!")
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
}
