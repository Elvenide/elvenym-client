import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { UserService } from '../user-service';

@Injectable({
  providedIn: 'root'
})
export class AbsurdleService {

  private _answer: string = "";
  private _guesses: Set<string> = new Set();
  public keyPressEvent = new Subject<string>();

  protected user = inject(UserService);

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

  private static resetCacheIfNecessary() {
    const day = localStorage.getItem("absurdle_day");
    if (!day)
      return;

    const lastDate = new Date(day);
    const currentDate = new Date();
    if (lastDate.getDate() == currentDate.getDate()
      && lastDate.getMonth() == currentDate.getMonth()
      && lastDate.getFullYear() == currentDate.getFullYear())
      return;

    localStorage.removeItem("absurdle_guesses");
    localStorage.removeItem("absurdle_row");
    localStorage.removeItem("absurdle_day");
  }

  public static generateGuessArray(MAX_GUESSES: number): [string, number][] {
    AbsurdleService.resetCacheIfNecessary();

    const cachedGuesses = localStorage.getItem("absurdle_guesses");
    if (cachedGuesses)
      return JSON.parse(cachedGuesses);
    
    const guesses = new Array(MAX_GUESSES).fill("");
    return guesses.map((v, i) => [v, i]);
  }

  public getActiveRow() {
    let activeRow = localStorage.getItem("absurdle_row") ?? "0";
    return Number(activeRow);
  }

  public saveGuesses(guesses: [string, number][], activeRow: number) {
    this.user.saveGameProgress("absurdle", {
      guesses: JSON.stringify(guesses),
      row: "" + activeRow,
      day: new Date().toISOString(),
      has_played: "true"
    });
  }

  public saveWin() {
    this.user.saveGameEnd("win", "absurdle");
  }

  public saveLoss() {
    this.user.saveGameEnd("loss", "absurdle");
  }

  public getWins() {
    const wins = localStorage.getItem("absurdle_wins") ?? "0";
    return Number(wins);
  }

  public getLosses() {
    const losses = localStorage.getItem("absurdle_losses") ?? "0";
    return Number(losses);
  }

  public hasPlayedBefore() {
    return localStorage.getItem("absurdle_has_played") == "true";
  }
}
