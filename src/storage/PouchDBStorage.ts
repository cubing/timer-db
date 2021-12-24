import PouchDB, { emit } from "pouchdb";
import PouchDBFind from "pouchdb-find";
import { Attempt, StoredAttempt } from "../data/Attempt";
import {
  SessionMetadata,
  StoredSessionMetadata,
} from "../data/SessionMetadata";
import { newAttemptUUID, newSessionUUID, SessionUUID } from "../UUID";
import {
  isValidAttemptData,
  isValidStoredSessionMetadata,
  isValidSessionMetadata,
} from "../data/validate";
import { SyncChangeListener } from "./Storage";

PouchDB.plugin(PouchDBFind);

// TODO: Make configurable.
const DB_URL = "https://couchdb.api.cubing.net/";

type PouchDocument = Attempt | SessionMetadata;

export class PouchDBStorage {
  // TODO: Change back to private fields once we figure out how to make it compatible with jest.
  private localDB: PouchDB.Database<PouchDocument>;
  private remoteDB?: PouchDB.Database<PouchDocument> = null;
  private sync?: PouchDB.Replication.Sync<PouchDocument>;
  private listeners: SyncChangeListener[] = [];
  constructor() {
    this.localDB = new PouchDB("timer_db_default"); // TODO
    // TODO: Ensure indices are being used.
    this.localDB.createIndex({
      index: { fields: ["sessionID"] }, // TODO
    });
    // this.localDB.createIndex({
    //   index: { fields: ["resultTotalMs"] }, // TODO
    // });
  }

  connectRemoteDB(username: string, password: string): void {
    const url = new URL(DB_URL);
    url.username = username;
    url.password = password;
    url.pathname = `results-${localStorage.timerDBUsername}`;
    const authedURL = url.toString();

    this.remoteDB = new PouchDB(authedURL);

    this.sync = this.localDB.sync(this.remoteDB, {
      live: true,
      retry: true,
    });
    this.sync.on("change", this.onSyncChange.bind(this));
    this.sync.on("error", this.onSyncError.bind(this));
  }

  // takes DB URL as a param
  connectRemoteDBCustom(dbURL: string, username: string, password: string): void {
    const url = new URL(dbURL);
    url.username = username;
    url.password = password;
    url.pathname = `results-${localStorage.timerDBUsername}`;
    const authedURL = url.toString();

    this.remoteDB = new PouchDB(authedURL);

    this.sync = this.localDB.sync(this.remoteDB, {
      live: true,
      retry: true,
    });
    this.sync.on("change", this.onSyncChange.bind(this));
    this.sync.on("error", this.onSyncError.bind(this));
  }

  addListener(listener: SyncChangeListener): void {
    this.listeners.push(listener);
  }

  removeListener(listener: SyncChangeListener): void {
    for (let i = 0; i < this.listeners.length; i++) {
      if (this.listeners[i] === listener) {
        this.listeners = this.listeners
          .slice(0, i)
          .concat(this.listeners.slice(i + 1));
        return;
      }
    }
    throw new Error(
      "Tried to remove a sync change listener that wasn't registered!"
    );
  }

  private onSyncChange(event: { change: { docs: StoredAttempt[] } }): void {
    for (const listener of this.listeners) {
      listener(event.change.docs);
    }
  }

  private onSyncError(err: Error): void {
    console.error("timer-db sync error", err);
  }

  // Modifies the attempt to add the ID and rev.
  async addNewAttempt(attempt: Attempt): Promise<StoredAttempt> {
    if (!isValidAttemptData(attempt)) {
      throw new Error("Attempted to store invalid attempt data");
    }
    const storedAttempt = attempt as StoredAttempt;
    storedAttempt._id = await newAttemptUUID(attempt.unixDate);
    const response = await this.localDB.put(storedAttempt);
    if (!response.ok) {
      throw new Error("Could not add attempt to session");
    }
    storedAttempt._rev = response.rev;
    return storedAttempt;
  }

  async updateAttempt(storedAttempt: StoredAttempt): Promise<void> {
    await this.localDB.put(storedAttempt);
  }

  async deleteAttempt(storedAttempt: StoredAttempt): Promise<void> {
    // (storedAttempt as any)._deleted = true; // TODO: safer typing.
    // TODO: put with _deleted = true?
    await this.localDB.remove(storedAttempt);
  }

  // Returns the n most recent attempts if there are at least n attempts, else returns all attempts.
  // Sorted by time (increasing).
  // TODO: Replace iteratore
  async latestAttempts(
    sessionID: SessionUUID,
    n: number
  ): Promise<StoredAttempt[]> {
    const dbResponse = (await this.localDB.find({
      limit: n,
      selector: {
        sessionID,
      },
      sort: [{ _id: "desc" }],
    })) as PouchDB.Find.FindResponse<StoredAttempt>;
    return dbResponse.docs.map((attempt) => {
      if (!isValidAttemptData(attempt)) {
        console.error("WARNING: Invalid attempt in database!", attempt);
      }
      return attempt;
    });
  }

  async createSession(
    sessionMetadata: SessionMetadata
  ): Promise<StoredSessionMetadata> {
    if (!isValidSessionMetadata(sessionMetadata)) {
      throw new Error("Attempted to store invalid attempt data");
    }
    const storedSessionMetadata = sessionMetadata as StoredSessionMetadata;
    if (!storedSessionMetadata._id) {
      storedSessionMetadata._id = await newSessionUUID();
    }
    const response = await this.localDB.put(storedSessionMetadata);
    if (!response.ok) {
      throw new Error("Could not add attempt to session");
    }
    storedSessionMetadata._rev = response.rev;
    return storedSessionMetadata;
  }

  async getAllSessions(): Promise<StoredSessionMetadata[]> {
    const dbResponse = (await this.localDB.allDocs({
      include_docs: true,
      startkey: "s_", // TODO: key: "s_"?
      endkey: "s_\ufff0",
    })) as PouchDB.Core.AllDocsResponse<StoredSessionMetadata>;
    return dbResponse.rows.map((row) => {
      const sessionMetadata = row.doc;
      if (!isValidStoredSessionMetadata(sessionMetadata)) {
        console.error("WARNING: Invalid attempt in database!", sessionMetadata);
      }
      return sessionMetadata;
    });
  }

  async sessionNumAttempts(sessionID: SessionUUID): Promise<number> {
    // TODO: Can we do this without getting the docs?
    const dbResponse = await this.localDB.find({
      fields: [],
      selector: {
        sessionID,
      },
    });
    return dbResponse.docs.length;
  }
}
