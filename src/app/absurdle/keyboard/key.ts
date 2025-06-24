import { Component, Input, output } from '@angular/core';
import { LetterState } from '../letter/letter';

@Component({
  selector: 'absurdle-key',
  imports: [],
  templateUrl: './key.html',
  styleUrl: './key.css'
})
export class Key {
  @Input() public letter = '';
  @Input() public isCorrect = false;
  @Input() public isIncorrect = false;
  @Input() public isMisplaced = false;

  public keyPressEvent = output<string>();
  
  protected get state() {
    if (this.isCorrect)
      return LetterState.CORRECT;

    if (this.isIncorrect)
      return LetterState.INCORRECT;

    if (this.isMisplaced)
      return LetterState.INVALID_POS;

    return LetterState.GUESSING;
  }

  protected onClick(event: MouseEvent) {
    this.keyPressEvent.emit(this.letter);
    setTimeout(() => {
      (event.target as HTMLDivElement).blur();
    }, 250);
  }

  // TODO animate keys when typed on laptop keyboard
}
