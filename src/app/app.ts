import { Component } from '@angular/core';
import { Absurdle } from './absurdle/absurdle';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Absurdle]
})
export class App {
  protected title = 'client';
}
