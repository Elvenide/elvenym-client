import { Injectable, signal } from '@angular/core';
import { DiscordSDK } from '@discord/embedded-app-sdk';

export interface DiscordUser {
  username: string;
  discriminator: string;
  id: string;
  public_flags: number;
  avatar?: string | null | undefined;
  global_name?: string | null | undefined;
}

const clientId = "1377786300681420810";

async function setupDiscordSdk(discordSdk: DiscordSDK) {
  await discordSdk.ready();
  console.log("Discord SDK is ready");

  // Authorize with Discord Client
  const { code } = await discordSdk.commands.authorize({
    client_id: clientId,
    response_type: "code",
    state: "",
    prompt: "none",
    scope: [
      "identify",
      "applications.commands"
    ],
  });

  // Retrieve an access_token from your activity's server
  // Note: No need for .proxy prefix due to my automatic remapping code in main.ts
  const response = await fetch("/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
    }),
  });
  const { access_token } = await response.json();

  // Authenticate with Discord client (using the access_token)
  let user: DiscordUser = (await discordSdk.commands.authenticate({
    access_token,
  }))?.user;

  if (user == null) {
    throw new Error("Discord authentication failed.");
  }

  return user;
}

const supportedPages = new Set([
  "home",
  "absurdle",
  "collections"
]);

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public readonly isDiscordReady = signal(false);
  private user?: DiscordUser;
  private discordSdk?: DiscordSDK;

  constructor() {
    try {
      this.discordSdk = new DiscordSDK(clientId);
      console.log("Elvenym is running in Discord activity mode.");
    }
    catch {
      this.discordSdk = undefined;
      console.log("Elvenym is running in regular web app mode.");
      return;
    }

    setupDiscordSdk(this.discordSdk).then(user => {
      this.user = user;
      this.isDiscordReady.set(true);
    });
  }

  getPage() {
    const page = location.hash.replace("#", "");
    return supportedPages.has(page) ? page : "home";
  }

  setPage(page: string) {
    location.href = "#" + page;
  }

  isDiscord() {
    return !!this.discordSdk;
  }

  getUser(): DiscordUser {
    return this.user!;
  }
}

// TODO: support loading/saving user data in Discord activity