import { Component, Input } from '@angular/core';

@Component({
  selector: 'collections-group',
  imports: [],
  templateUrl: './group.html',
  styleUrl: './group.css'
})
export class Group {
  @Input({ required: true }) public index!: number;
  @Input({ required: true }) public name!: string;
  @Input({ required: true }) public members!: [string, string, string, string];
  @Input({ required: true }) public difficulty!: number;
}
