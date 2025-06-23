import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AbsurdleService {

  private _answer = "absurd"; // fake answer temporarily

  constructor() { }

  public answer(): string {
    return this._answer;
  }
}
