import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../user-service';

export interface CollectionsGroup {
    difficulty: number;
    group: string;
    members: [string, string, string, string];
}

@Injectable({
  providedIn: 'root'
})
export class CollectionsService {

  private _answer: CollectionsGroup[] = [];
  protected user = inject(UserService);

  constructor() { }

  public answer(): CollectionsGroup[] {
    return this._answer;
  }

  public isLoaded(): boolean {
    return this._answer.length > 0;
  }

  public fetchDailyAnswer(): Observable<any> {
    return new Observable((observer) => {
      fetch("/api/collections/answers")
        .then(b => b.json())
        .then(data => {
          this._answer = data.groups;
          setTimeout(() => {
            observer.next(true);
          }, 1500);
        });
    });
  }

  private static resetCacheIfNecessary() {
    const day = localStorage.getItem("collections_day");
    if (!day)
      return;

    const lastDate = new Date(day);
    const currentDate = new Date();
    if (lastDate.getDate() == currentDate.getDate()
      && lastDate.getMonth() == currentDate.getMonth()
      && lastDate.getFullYear() == currentDate.getFullYear())
      return;

    localStorage.removeItem("collections_groups");
    localStorage.removeItem("collections_day");
    localStorage.removeItem("collections_lives");
  }

  public static generateGroupArray(): CollectionsGroup[] {
    CollectionsService.resetCacheIfNecessary();

    const cachedGroups = localStorage.getItem("collections_groups");
    if (cachedGroups)
      return JSON.parse(cachedGroups);
    
    return [];
  }

  public getLives(MAX_GROUPS: number) {
    let lives = localStorage.getItem("collections_lives") ?? "" + MAX_GROUPS;
    return Number(lives);
  }

  public saveGroups(groups: CollectionsGroup[], lives: number) {
    this.user.saveGameProgress("collections", {
      groups: JSON.stringify(groups),
      day: new Date().toISOString(),
      has_played: "true",
      lives: "" + lives
    });
  }

  public saveWin() {
    this.user.saveGameEnd("win", "collections");
  }

  public saveLoss() {
    this.user.saveGameEnd("loss", "collections");
  }

  public getWins() {
    const wins = localStorage.getItem("collections_wins") ?? "0";
    return Number(wins);
  }

  public getLosses() {
    const losses = localStorage.getItem("collections_losses") ?? "0";
    return Number(losses);
  }

  public hasPlayedBefore() {
    return localStorage.getItem("collections_has_played") == "true";
  }
}
