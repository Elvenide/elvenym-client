import { Component, inject, Input } from '@angular/core';
import { Letter, LetterState } from '../letter/letter';
import { AbsurdleService } from '../service';

@Component({
  selector: 'absurdle-row',
  imports: [Letter],
  templateUrl: './row.html',
  styleUrl: './row.css'
})
export class Row {
  @Input() public active = false;
  @Input() public word = '';

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

      for (let i = 0; i < index; i++) {
        if (this.getLetters()[i][0] == letter)
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
}
