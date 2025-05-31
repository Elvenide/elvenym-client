import { Component } from '@angular/core';
import { Nav } from './nav/nav';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Nav]
})
export class App {
  protected title = 'client';
}
