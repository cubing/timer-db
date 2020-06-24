import { StoredAttempt } from "../data/Attempt";
import { newAttemptUUID } from "../UUID";
import { AttemptCache } from "./AttemptCache";
import { PouchDBStorage } from "./PouchDBStorage";

// TODO: remove
async function fakeAttempt(k: number): Promise<StoredAttempt> {
  const date = 10000000000 + k;
  return {
    _id: await newAttemptUUID(date),
    _rev: null, // TODO
    totalResultMs: 100 + k,
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
      return (await cache.kthMostRecent(1)).totalResultMs;
    })()
  ).resolves.toBe(104);
});
