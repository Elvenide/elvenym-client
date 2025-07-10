import { booleanAttribute, Component, Input } from '@angular/core';
import { NgIcon, provideNgIconLoader, withCaching } from '@ng-icons/core';
import * as material from "@ng-icons/material-icons/baseline";
import * as materialOutline from "@ng-icons/material-icons/outline";

@Component({
  selector: 'icon',
  imports: [NgIcon],
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  providers: [
    provideNgIconLoader(name => {
      if (name.startsWith("outline:")) {
        name = name.slice(8);
        const refinedName = name.split("_").map(word =>
          word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()
        ).join("");
        let preKey = "mat" + refinedName;
        if (preKey + "OutlineOutline" in materialOutline)
          preKey += "Outline";
        const key = (preKey + "Outline") as keyof typeof materialOutline;
        return materialOutline[key];
      }

      const refinedName = name.split("_").map(word =>
        word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase()
      ).join("");
      const key = ("mat" + refinedName) as keyof typeof material;
      return material[key];
    }, withCaching())
  ]
})
export class Icon {
  @Input({ required: true }) public name!: string;
  @Input({ transform: booleanAttribute }) public small: boolean = false;
  @Input({ transform: booleanAttribute }) public medium: boolean = false;
  @Input({ transform: booleanAttribute }) public large: boolean = false;
}
