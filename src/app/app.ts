import { Component } from '@angular/core';
import { Absurdle } from './absurdle/absurdle';
import { Collections } from "./collections/collections";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [/*Absurdle,*/ Collections]
})
export class App {
  protected title = 'client';
}
