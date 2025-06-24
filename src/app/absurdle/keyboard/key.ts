import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { LetterState } from '../letter/letter';
import { AbsurdleService } from '../service';

@Component({
  selector: 'absurdle-key',
  imports: [],
  templateUrl: './key.html',
  styleUrl: './key.css'
})
export class Key implements OnInit {
  @Input() public letter = '';
  @Input() public isCorrect = false;
  @Input() public isIncorrect = false;
  @Input() public isMisplaced = false;

  protected animateClass = signal("");
  protected absurdle = inject(AbsurdleService);
  
  protected get state() {
    if (this.isCorrect)
      return LetterState.CORRECT;

    if (this.isIncorrect)
      return LetterState.INCORRECT;

    if (this.isMisplaced)
      return LetterState.INVALID_POS;

    return LetterState.GUESSING;
  }

  protected onClick() {
    let letter = this.letter;
    if (this.letter == "⌫") letter = "backspace";
    else if (this.letter == "⏎") letter = "enter"; 

    this.absurdle.keyPressEvent.next(letter);
  }

  ngOnInit(): void {
      this.absurdle.keyPressEvent.subscribe(key => {
        if (this.letter == "⌫" && key == "backspace") {}
        else if (this.letter == "⏎" && key == "enter") {}
        else if (key != this.letter)
          return;

        this.animateClass.set(" type_animation");
        setTimeout(() => {
          this.animateClass.set("");
        }, 250);
      });
  }
}
