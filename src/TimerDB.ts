import { EventName, StoredAttempt, Attempt } from "./data/Attempt";
import { PouchDBStorage } from "./storage/PouchDBStorage";
import { Session } from "./session";
import { newAttemptUUID } from "./UUID";

export class TimerDB {
  private pouch: PouchDBStorage;
  constructor() {
    this.pouch = new PouchDBStorage();
  }

  startSync(params: { username: string; password: string }): void {
    this.pouch.connectRemoteDB(params.username, params.password);
  }

  // TODO: provide a way to get only sessions with solves.
  async getSessions(): Promise<Session[]> {
    const sessionMetadataList = await this.pouch.getAllSessions();
    return sessionMetadataList.map(
      (sessionMetadata) => new Session(this.pouch, sessionMetadata)
    );
  }

  // TODO: `event: EventName`
  async createSession(sessionName: string, event: EventName): Promise<Session> {
    return await Session.create(this.pouch, sessionName, event);
  }
}
