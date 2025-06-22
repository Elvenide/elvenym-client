import { Component } from '@angular/core';

export const LetterState = {
  DISABLED: "disabled",
  GUESSING: "guessing",
  INCORRECT: "incorrect",
  INVALID_POS: "invalid_pos",
  CORRECT: "correct"
};

@Component({
  selector: 'absurdle-letter',
  imports: [],
  templateUrl: './letter.html',
  styleUrl: './letter.css'
})
export class Letter {
  protected letter = '';
  protected state = LetterState.DISABLED;
}
