
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { patchUrlMappings } from "@discord/embedded-app-sdk";

// If running in Discord activity, patch URL mappings
if (window.self !== window.top) {
  patchUrlMappings([{ prefix: "/api", target: "1377786300681420810.discordsays.com/.proxy/api" }]);
}

// Handle Angular app
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
