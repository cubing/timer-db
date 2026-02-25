import { expect, test } from "bun:test";
import assert from "node:assert";
import type { StoredAttempt } from "../data/Attempt";
import { newAttemptUUID } from "../UUID";
import { AttemptCache } from "./AttemptCache";
import { PouchDBStorage } from "./PouchDBStorage";

// TODO: remove
async function fakeAttempt(k: number): Promise<StoredAttempt> {
  const date = 10000000000 + k;
  return {
    _id: newAttemptUUID(date),
    _rev: "", // TODO
    resultTotalMs: 100 + k,
    unixDate: date,
  };
}

test("should construct", async () => {
  await expect(
    (async () => {
      const db = new PouchDBStorage();
      const cache = new AttemptCache(db, "Test Session", 0);
      await cache.set(await fakeAttempt(4));
      await cache.set(await fakeAttempt(1));
      await cache.set(await fakeAttempt(7));
      const mostRecent = await cache.kthMostRecent(1);
      assert.ok(mostRecent);
      return mostRecent.resultTotalMs;
    })(),
  ).resolves.toBe(104);
});
