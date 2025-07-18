import { Injectable } from '@angular/core';

const supportedPages = new Set([
  "home",
  "absurdle",
  "collections"
]);

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  // TODO: support pages in Discord activity

  getPage() {
    const page = location.hash.replace("#", "");
    return supportedPages.has(page) ? page : "home";
  }

  setPage(page: string) {
    location.href = "#" + page;
  }
}
