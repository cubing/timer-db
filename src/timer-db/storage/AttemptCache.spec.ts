import { StoredAttempt } from "../data/Attempt";
import { newAttemptUUID } from "../UUID";
import { AttemptCache } from "./AttemptCache";
import { PouchDBStorage } from "./PouchDBStorage";

// TODO: remove
function fakeAttempt(k: number): StoredAttempt {
  const date = 10000000000 + k;
  return {
    _id: newAttemptUUID(date),
    _rev: null, // TODO
    resultTotalMs: 100 + k,
    unixDate: date,
  };
}

test("should construct", async () => {
  await expect(
    (async () => {
      const db = new PouchDBStorage();
      const cache = new AttemptCache(db, "Test Session", 0);
      await cache.set(fakeAttempt(4));
      await cache.set(fakeAttempt(1));
      await cache.set(fakeAttempt(7));
      return (await cache.kthMostRecent(1)).resultTotalMs;
    })()
  ).resolves.toBe(104);
});
