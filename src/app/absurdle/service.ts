import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AbsurdleService {

  private _answer: string = "";
  private _guesses: Set<string> = new Set();

  constructor() { }

  public answer(): string {
    return this._answer;
  }

  public isValidGuess(word: string): boolean {
    if (word.length != 6)
      return false;
    return this._guesses.has(word);
  }

  public isLoaded(): boolean {
    return this._answer != "";
  }

  public fetchDailyAnswer(): Observable<any> {
    return new Observable((observer) => {
      fetch("/api/absurdle/words")
        .then(b => b.json())
        .then(data => {
          this._answer = data.answer;
          this._guesses = new Set(data.guesses);
          observer.next(true)
        });
    });
  }
}
