import { Component, inject } from '@angular/core';
import { Absurdle } from './absurdle/absurdle';
import { Collections } from "./collections/collections";
import { UserService } from './user-service';
import { Icon } from "./icon/icon";
import { Avatar } from "./avatar/avatar";

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Absurdle, Collections, Icon, Avatar]
})
export class App {
  protected user = inject(UserService);
}
