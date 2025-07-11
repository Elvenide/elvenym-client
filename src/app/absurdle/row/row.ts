import { Component, inject, Input, OnChanges, output, signal } from '@angular/core';
import { Letter, LetterState } from '../letter/letter';
import { AbsurdleService } from '../service';

@Component({
  selector: 'absurdle-row',
  imports: [Letter],
  templateUrl: './row.html',
  styleUrl: './row.css'
})
export class Row implements OnChanges {
  @Input() public active = false;
  @Input() public word = '';
  @Input() public shouldTypeAnimate = true;
  @Input() public shouldInvalidAnimate = false;
  public winEvent = output<void>();
  protected winIndex = signal(-1);

  protected absurdle = inject(AbsurdleService);

  protected getLetters(): [string, number][] {
    const letters: [string, number][] = this.word.split("").map((l, i) => [l, i]);
    if (letters.length < 6)
      for (let i = letters.length; i < 6; i++)
        letters.push(["", i]);
    return letters;
  }

  protected getLetterState(index: number): string {
    // If active, guessing letter
    if (this.active)
      return LetterState.GUESSING;

    const letter = this.getLetters()?.[index]?.[0];

    // Disabled letter
    if (!letter)
      return LetterState.DISABLED;

    // Correct letter
    if (letter == this.absurdle.answer()[index])
      return LetterState.CORRECT;

    // Invalid position letter
    if (this.absurdle.answer().includes(letter)) {
      const answerOccurrences = this.absurdle.answer().split("").filter(l => l == letter).length;
      let prevGuessOccurrences = 0;

      for (let i = 0; i < 6; i++) {
        if (this.word.length <= i || i == index)
          continue;
        if (this.getLetters()[i][0] != letter)
          continue;

        if (this.absurdle.answer()[i] == letter)
          prevGuessOccurrences++;
        else if (i < index)
          prevGuessOccurrences++;
      }

      if (prevGuessOccurrences >= answerOccurrences)
        return LetterState.INCORRECT;
      else
        return LetterState.INVALID_POS;
    }

    // Incorrect letter
    return LetterState.INCORRECT;
  }

  protected isWin() {
    for (let i = 0; i < 6; i++)
      if (this.getLetterState(i) != LetterState.CORRECT)
        return false;

    return true;
  }

  protected shouldAnimateLetter(index: number): boolean {
    if (this.winIndex() == index)
      return true;
    return this.shouldTypeAnimate && this.active && index == this.word.length - 1;
  }

  ngOnChanges() {
    let interval: number;
    let index = -1;
    if (this.isWin())
      interval = setInterval(() => {
        index++;
        if (index >= 6) {
          clearInterval(interval);
          this.winEvent.emit();
          return;
        }

        this.winIndex.set(index);
      }, 350);
  }
}
