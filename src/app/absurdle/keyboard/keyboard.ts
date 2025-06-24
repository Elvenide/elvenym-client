import { Component, Input } from '@angular/core';
import { Key } from './key';

@Component({
  selector: 'absurdle-keyboard',
  imports: [Key],
  templateUrl: './keyboard.html',
  styleUrl: './keyboard.css'
})
export class Keyboard {
  protected topRowKeys = "qwertyuiop".split("");
  protected midRowKeys = "asdfghjkl".split("");
  protected lowRowKeys = "zxcvbnm".split("");

  @Input() public correctKeys: Set<string> = new Set();
  @Input() public incorrectKeys: Set<string> = new Set();
  @Input() public misplacedKeys: Set<string> = new Set();
}
