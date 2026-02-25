import type { Session } from "../timer-db";
import {
  LOCALSTORAGE_KEY_FOR_TIMER_DB_PASSWORD,
  LOCALSTORAGE_KEY_FOR_TIMER_DB_USERNAME,
} from "../timer-db/storage/PouchDBStorage";

globalThis.addEventListener("DOMContentLoaded", async () => {
  const { TimerDB } = await import("../timer-db");

  const db = new TimerDB();
  // biome-ignore lint/suspicious/noExplicitAny: For debugging.
  (globalThis as any).db = db;

  const timerDB = new TimerDB();
  timerDB.startSync({
    username: localStorage[LOCALSTORAGE_KEY_FOR_TIMER_DB_USERNAME],
    password: localStorage[LOCALSTORAGE_KEY_FOR_TIMER_DB_PASSWORD],
  });
  const sessions = await timerDB.getSessions();
  const s: Session =
    sessions[0] ?? (await timerDB.createSession("My 4x4x4 Solves", "4x4x4"));
  s.addStatListener(console.log);

  if ((await s.nMostRecent(3)).length < 3) {
    await s.add({
      resultTotalMs: Math.floor(5000 + 10000 * Math.random()),
      unixDate: Date.now(),
    });
  }

  console.log(await s.nMostRecent(10));
});
