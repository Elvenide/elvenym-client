import { Injectable, signal } from '@angular/core';
import { DiscordSDK } from '@discord/embedded-app-sdk';

/**
 * Represents the properties of a Discord user object.
 */
export interface DiscordUser {
  username: string;
  discriminator: string;
  id: string;
  public_flags: number;
  avatar?: string | null | undefined;
  global_name?: string | null | undefined;
}

/**
 * Represents an individual game's save-data.
 */
export interface GameStats {
  wins?: number;
  losses?: number;
  info?: Record<string, any>;
}

/**
 * Represents all games' save-data for a user.
 */
export interface UserGameData {
  absurdle: GameStats;
  collections: GameStats;
}

/**
 * Represents an Elvenym user with personal game save-data.
 */
export interface User {
  id: string;
  avatar?: string; // Discord avatar URL
  data: UserGameData;
}

/**
 * Represents a group of Elvenym users in a Discord guild/DM.
 */
export interface Group {
  id: string;
  userIds: string[];
  users: { [id: string]: User };
}

/** ID of the Discord activity. */
const clientId = "1377786300681420810";

/**
 * Initializes and authenticates with the Discord SDK.
 */
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
    })
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

/**
 * Adds or updates a user on the Elvenym backend.
 */
async function addUser(userId: string, groupId: string, avatar?: string) {
  const response: { success?: 1|0 } = await (await fetch("/api/data/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      groupId,
      avatar
    })
  })).json();

  if (!response?.success)
    throw new Error("Failed to find user's Elvenym data.");
}

/**
 * Loads data for all users in the current Elvenym group.
 */
async function loadGroupData(groupId: string) {
  const response: Group = await (await fetch("/api/data/group/" + groupId)).json();
  return response;
}

/**
 * Increments wins in the given game for the Elvenym user.
 */
async function addWin(userId: string, game: keyof UserGameData) {
  const response: { success?: 1|0 } = await (await fetch("/api/data/win/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      game
    })
  })).json();

  if (!response?.success)
    throw new Error("Failed to add win to user's Elvenym data.");
}

/**
 * Increments losses in the given game for the Elvenym user.
 */
async function addLoss(userId: string, game: keyof UserGameData) {
  const response: { success?: 1|0 } = await (await fetch("/api/data/loss/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      game
    })
  })).json();

  if (!response?.success)
    throw new Error("Failed to add loss to user's Elvenym data.");
}

/**
 * Updates progress in the given game for the Elvenym user.
 */
async function setInfo(userId: string, game: keyof UserGameData, info: Record<string, any>) {
  const response: { success?: 1|0 } = await (await fetch("/api/data/info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      game,
      info
    })
  })).json();

  if (!response?.success)
    throw new Error("Failed to set game info in user's Elvenym data.");
}

/**
 * All pages accessible in the app.
 */
const supportedPages = new Set([
  "home",
  "absurdle",
  "collections"
]);

/**
 * An injectable Angular service to access Discord user
 * data, Elvenym user/group/game data, and manage
 * user pagination.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {

  public readonly isDiscordReady = signal(false);
  private user?: DiscordUser;
  private discordSdk?: DiscordSDK;
  private group?: Group;

  private page: string;

  constructor() {
    const page = location.hash.replace("#", "");
    this.page = supportedPages.has(page) ? page : "home";

    try {
      this.discordSdk = new DiscordSDK(clientId);
      console.log("Elvenym is running in Discord activity mode.");
    }
    catch {
      this.discordSdk = undefined;
      console.log("Elvenym is running in regular web app mode.");
      return;
    }

    setupDiscordSdk(this.discordSdk).then(async user => {
      this.user = user;

      // Add or update user data on backend
      await addUser(this.getId()!, this.getGroupId()!, this.getAvatar());
      
      // Load group data
      this.group = await loadGroupData(this.getGroupId()!);

      // Load user data from group data
      const dataUser = this.group.users[this.getId()!];
      for (const game in dataUser.data) {
        const gameData = dataUser.data[game as keyof UserGameData];
        const wins = gameData.wins ?? 0;
        const losses = gameData.losses ?? 0;
        
        // Save win/loss data into localStorage
        localStorage.setItem(game + "_wins", "" + wins);
        localStorage.setItem(game + "_losses", "" + losses);

        // Save misc info data into localStorage
        for (const infoKey in gameData.info ?? {})
          localStorage.setItem(game + "_" + infoKey, gameData.info![infoKey]);
      }

      // We are now ready to display app
      this.isDiscordReady.set(true);
      console.log("Fully loaded Elvenym in Discord activity mode.");
    });
  }

  getPage() {
    return this.page;
  }

  setPage(page: string) {
    this.page = page;
  }

  isDiscord() {
    return !!this.discordSdk;
  }

  getId() {
    return this.user?.id;
  }

  getUsername() {
    return this.user?.username;
  }

  getAvatar() {
    if (!this.user)
      return undefined;

    return "https://cdn.discordapp.com/avatars/"
      + this.user.id + "/"
      + this.user.avatar;
  }

  getGroupId() {
    if (!this.discordSdk || !this.user)
      return undefined;

    return this.discordSdk.guildId ?? this.discordSdk.channelId;
  }

  saveGameEnd(endType: "win"|"loss", game: keyof UserGameData) {
    //
    // Save to localStorage
    //

    let wins: number, losses: number;

    // Get current win/loss info depending on whether we're in Discord
    if (!!this.discordSdk && !!this.user) {
      const dataUser = this.group!.users[this.getId()!];
      const gameData = dataUser.data[game];
      wins = gameData.wins ?? 0;
      losses = gameData.losses ?? 0;
    }
    else {
      wins = Number(localStorage.getItem(game + "_wins") ?? "0");
      losses = Number(localStorage.getItem(game + "_losses") ?? "0");
    }

    // Increment win/loss
    if (endType == "win")
      wins++;
    else
      losses++;

    // Save win/loss data into localStorage
    localStorage.setItem(game + "_wins", "" + wins);
    localStorage.setItem(game + "_losses", "" + losses);

    //
    // Save to backend
    //

    // But only if in Discord
    if (!this.discordSdk || !this.user)
      return;

    if (endType == "win")
      addWin(this.getId()!, game);
    else
      addLoss(this.getId()!, game);
  }

  saveGameProgress(game: keyof UserGameData, info: Record<string, any>) {
    //
    // Save to localStorage
    //

    for (const infoKey in info ?? {})
      localStorage.setItem(game + "_" + infoKey, info![infoKey]);

    //
    // Save to backend
    //

    // But only if in Discord
    if (!this.discordSdk || !this.user)
      return;

    setInfo(this.getId()!, game, info);
  }

  /**
   * Gets data for all users in the current group,
   * except the current user.
   */
  getOtherUsers(): User[] {
    if (!this.group || !this.user)
      return [];

    const remainingGroup = [];
    for (const userId in this.group.users) {
      if (userId == this.getId())
        continue;

      remainingGroup.push(this.group.users[userId]);
    }

    return remainingGroup;
  }

}