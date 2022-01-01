// https://www.npmjs.com/package/@collectable/red-black-tree
import {
  fromPairsWithStringKeys,
  RedBlackTreeStructure,
  iterateFromFirst,
  iterateValuesFromLast,
  remove,
  set,
  size,
  valueAt,
} from "@collectable/red-black-tree";
import { StoredAttempt } from "../data/Attempt";
import { PouchDBStorage } from "./PouchDBStorage";
import { AttemptUUID, SessionUUID } from "../UUID";
import { Storage } from "./Storage";

const MIN_SIZE_CAP = 1000;
const MAX_SIZE_CAP = 1050;

type RedBlackTree = RedBlackTreeStructure<string, StoredAttempt>;

// The cache will contain at least `size` entries.
// If it gets > minSize or < maxSize entries, it will be adjusted to midSize.
export class AttemptCache {
  private latestSolves: Promise<RedBlackTree>;
  constructor(
    private storage: Storage,
    private sessionID: SessionUUID,
    private minSize: number = 100,
    private midSize: number = minSize + 25,
    private maxSize: number = minSize + 50
  ) {
    if (minSize > midSize || midSize > maxSize) {
      throw new Error("AttemptCache initialized with invalid size parameters.");
    }
    if (this.minSize > MIN_SIZE_CAP) {
      throw new Error(`AttemptCache min size is capped at ${MIN_SIZE_CAP}`);
    }
    if (this.maxSize > MAX_SIZE_CAP) {
      throw new Error(`AttemptCache max size is capped at ${MAX_SIZE_CAP}.`);
    }
    this.latestSolves = this.getLatestFromDB(this.midSize);
  }

  /******** Functions that don't access `this.latestSolves`. ********/

  async getLatestFromDB(n: number): Promise<RedBlackTree> {
    const attempts: StoredAttempt[] = await this.storage.latestAttempts(
      this.sessionID,
      n
    );
    const pairs: [AttemptUUID, StoredAttempt][] = attempts.map((attempt) => [
      attempt._id,
      attempt,
    ]);
    return fromPairsWithStringKeys<StoredAttempt>(pairs);
  }

  private growToMidSize(tree: RedBlackTree): Promise<RedBlackTree> {
    return this.getLatestFromDB(this.midSize); // TODO: Only get the ones we need.
  }

  private shrinkToMidSize(tree: RedBlackTree): Promise<RedBlackTree> {
    // TODO: Is calling `this.getLatest` about as efficient?
    const newPairs: [AttemptUUID, StoredAttempt][] = [];
    let i = 0;
    for (const attempt of iterateValuesFromLast<string, StoredAttempt>(tree)) {
      newPairs.push([attempt._id, attempt]);
      i++;
      if (i >= this.midSize) {
        break;
      }
    }
    return Promise.resolve(fromPairsWithStringKeys<StoredAttempt>(newPairs));
  }

  // TODO: This will constantly try to grow if there are fewer than minSize
  // attempts. We can avoid that by keeping count of the number of attempts, and
  // avoid size maintenance operations until there are at least minSize attempts
  // in the session.
  private async maintainSize(tree: RedBlackTree): Promise<RedBlackTree> {
    const prevSize = await size<string, StoredAttempt>(tree);
    if (prevSize < this.minSize) {
      return this.growToMidSize(tree);
    } else if (prevSize > this.maxSize) {
      return this.shrinkToMidSize(tree);
    } else {
      return tree;
    }
  }

  /******** Functions that DO access `this.latestSolves`. ********/

  async debugCurrentSize(): Promise<number> {
    return size(await this.latestSolves);
  }

  async debugPrint(): Promise<void> {
    const l = [];
    for (const entry of iterateFromFirst<string, StoredAttempt>(
      await this.latestSolves
    )) {
      l.push([entry.key, entry.value.resultTotalMs]);
    }
    console.table(l);
  }

  // TODO: Use a lock to synchronize subbsequent calls in case the caller doesn't `await`?
  async set(storedAttempt: StoredAttempt): Promise<void> {
    const prevLatestSolves = await this.latestSolves;
    this.latestSolves = (async () => {
      return this.maintainSize(
        set(storedAttempt._id, storedAttempt, prevLatestSolves)
      );
    })();
  }

  // Does nothing if the attempt doesn't exist.
  async delete(id: AttemptUUID): Promise<void> {
    const prevLatestSolves = await this.latestSolves;
    this.latestSolves = (async () => {
      return this.maintainSize(remove(id, prevLatestSolves));
    })();
  }

  async kthMostRecent(k: number): Promise<StoredAttempt | null> {
    const latestSolves = await this.latestSolves;
    return valueAt(-k - 1, latestSolves) ?? null;
  }

  async nMostRecent(n: number): Promise<StoredAttempt[]> {
    const l: StoredAttempt[] = [];
    let i = 0;
    const iterator = iterateValuesFromLast<string, StoredAttempt>(
      await this.latestSolves
    );
    for (const attempt of iterator) {
      l.push(attempt);
      i++;
      if (i >= n) {
        break;
      }
    }
    return l;
  }
}
