// This should be a `.d.ts` file, but we need to make it `.ts` (or Parcel won't include it in the output).

import { AttemptCache } from "./storage/AttemptCache";
import { Attempt, StoredAttempt, EventName } from "./data/Attempt";
import { PouchDBStorage } from "./storage/PouchDBStorage";
import { StoredSessionMetadata, SessionMetadata } from "./data/SessionMetadata";
import { SessionUUID } from "./UUID";
import { mean, trimmedAverage, best, worst } from "./stats";
import { Storage } from "./storage/Storage";

interface StatSnapshot {
  latest100: StoredAttempt[]; // TODO: Use a more efficient way to pass this.
  mean3: number | null;
  avg5: number | null;
  avg12: number | null;
  avg100: number | null;
  best100: number | null;
  worst100: number | null;
  // TODO
  avg1000?: number;
  best1000?: number;
  worst1000?: number;
  // TODO: number of attempts.
  // TODO: best/worst attempts of the whole session
  // TODO: best/worst averages of the whole session
  // TODO: include latest 100 attempts?
}

export type StatListener = (statsSnapshot: StatSnapshot) => void;

export class Session implements SessionMetadata {
  #storage: Storage;
  #cache: AttemptCache;
  #metadata: StoredSessionMetadata;
  #statListeners: StatListener[] = [];
  name: string;
  eventID: string;
  _id: SessionUUID;
  constructor(storage: Storage, metadata: StoredSessionMetadata) {
    this.#storage = storage;
    this.#metadata = metadata;
    this.name = this.#metadata.name;
    this.eventID = this.#metadata.eventID;
    this._id = this.#metadata._id;
    this.#cache = new AttemptCache(storage, this.#metadata._id);
    this.#storage.addListener(this.onSyncChange.bind(this));
  }

  static async create(
    storage: Storage,
    name: string,
    event: EventName
  ): Promise<Session> {
    return new Session(
      storage,
      await storage.createSession({ name, eventID: event })
    );
  }

  private async onSyncChange(attempts: StoredAttempt[]) {
    for (const attempt of attempts) {
      if (attempt._deleted || attempt.sessionID !== this._id) {
        await this.#cache.delete(attempt._id);
        continue;
      } else {
        await this.#cache.set(attempt);
      }
    }
    this.fireStatListeners();
  }

  async getStatSnapshot(): Promise<StatSnapshot> {
    // TODO: Implement optimized data strctures for this.
    const latest100 = await this.nMostRecent(100);
    const latest12 = latest100.slice(0, 12);
    const latest5 = latest100.slice(0, 5);
    const latest3 = latest100.slice(0, 3);
    return {
      latest100,
      mean3: latest3.length < 3 ? null : mean(latest3),
      avg5: latest5.length < 5 ? null : trimmedAverage(latest5),
      avg12: latest12.length < 12 ? null : trimmedAverage(latest12),
      avg100: latest100.length < 100 ? null : trimmedAverage(latest100),
      best100: best(latest100),
      worst100: worst(latest100),
    };
  }

  addStatListener(listener: StatListener): void {
    this.#statListeners.push(listener);
  }

  removeStatListener(listener: StatListener): void {
    for (let i = 0; i < this.#statListeners.length; i++) {
      if (this.#statListeners[i] === listener) {
        this.#statListeners = this.#statListeners
          .slice(0, i)
          .concat(this.#statListeners.slice(i + 1));
        return;
      }
    }
    throw new Error("Tried to remove a stats listener that wasn't registered!");
  }

  private async fireStatListeners(): Promise<void> {
    // TODO: avoid firing when none of the stats changed.
    const statSnapshot = await this.getStatSnapshot();
    for (const listener of this.#statListeners) {
      listener(statSnapshot);
    }
  }

  // Modifies the attempt to add the ID and rev.
  async add(attempt: Attempt): Promise<StoredAttempt> {
    attempt.sessionID = this._id;
    const storedAttempt = await this.#storage.addNewAttempt(attempt);
    this.#cache.set(storedAttempt);
    await this.fireStatListeners();
    return storedAttempt;
  }

  async update(storedAttempt: StoredAttempt): Promise<void> {
    // TODO: handle session change.
    this.#storage.updateAttempt(storedAttempt);
    this.#cache.set(storedAttempt);
    await this.fireStatListeners();
  }

  async delete(storedAttempt: StoredAttempt): Promise<void> {
    // We could use `Promise.all`, but we do these sequentially in case there was an error during delection.
    await this.#storage.deleteAttempt(storedAttempt);
    await this.#cache.delete(storedAttempt._id);
    await this.fireStatListeners();
  }

  async kthMostRecent(k: number): Promise<StoredAttempt | null> {
    return this.#cache.kthMostRecent(k);
  }

  // TODO: handle cap limits.
  // TODO: Return iterator?
  async nMostRecent(n: number): Promise<StoredAttempt[]> {
    return this.#cache.nMostRecent(n);
  }

  // TODO: Use cache to keep track of this.
  async numAttempts(): Promise<number> {
    return this.#storage.sessionNumAttempts(this._id);
  }

  /******** Debug ********/

  private async debugPouch(): Promise<Storage> {
    return this.#storage;
  }

  private async debugCache(): Promise<AttemptCache> {
    return this.#cache;
  }
}
