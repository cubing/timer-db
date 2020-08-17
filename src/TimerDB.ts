import { EventName, StoredAttempt, Attempt } from "./data/Attempt";
import { PouchDBStorage } from "./storage/PouchDBStorage";
import { Session } from "./session";
import { Storage } from "./storage/Storage";

export class TimerDB {
  private storage: Storage;
  constructor() {
    this.storage = new PouchDBStorage();
  }

  startSync(params: { username: string; password: string }): void {
    this.storage.connectRemoteDB(params.username, params.password);
  }

  // TODO: provide a way to get only sessions with solves.
  async getSessions(): Promise<Session[]> {
    const sessionMetadataList = await this.storage.getAllSessions();
    return sessionMetadataList.map(
      (sessionMetadata) => new Session(this.storage, sessionMetadata, false)
    );
  }

  // TODO: `event: EventName`
  async createSession(
    sessionName: string,
    event: EventName,
    stub: boolean = false
  ): Promise<Session> {
    return await Session.create(this.storage, sessionName, event, stub);
  }
}
