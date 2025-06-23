import { Component, Input } from '@angular/core';

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
  @Input() public letter = '';
  @Input() public state = LetterState.DISABLED;
  @Input() public typeAnimation = false;
  @Input() public invalidAnimation = false;
}
