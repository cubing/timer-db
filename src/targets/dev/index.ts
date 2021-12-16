(globalThis as any).global = globalThis; // Nonsense for a transitive dependency of `pouchdb`.

import type { Session } from "../..";

window.addEventListener("DOMContentLoaded", async () => {
  const { TimerDB } = await import("../..");

  const db = new TimerDB();
  (window as any).db = db;

  const timerDB = new TimerDB();
  timerDB.startSync({
    username: localStorage["timerDBUsername"],
    password: localStorage["timerDBPassword"],
  });
  const sessions = await timerDB.getSessions();
  const s: Session =
    sessions[0] ?? (await timerDB.createSession("My 4x4x4 Solves", "4x4x4"));
  s.addStatListener(console.log);
  // s.add({
  //   resultTotalMs: Math.floor(5000 + 10000 * Math.random()),
  //   unixDate: Date.now(),
  // });

  const stubSesh = await timerDB.createSession("3x3x3 sesh!", "333", {
    stub: true,
  });
  // stubSesh.add({
  //   resultTotalMs: Math.floor(5000 + 10000 * Math.random()),
  //   unixDate: Date.now(),
  // });
  console.log(stubSesh);

  // const s = (await db.listSessions())[0];

  // s.addStatListener(console.log);

  // s.add(s.debugMakeAttempt(4));

  // s.add(s.debugMakeAttempt(10));

  // s.add(s.debugMakeAttempt(9));
  // s.add(s.debugMakeAttempt(5));
  // s.add(s.debugMakeAttempt(12));

  // console.log(await s.nMostRecent(10));

  // const p = await s.debugPouch();
  // console.log(await p.latestAttempts(s._id, 100));

  // // const c = await s.debugCache();
  // (window as any).s = s;
  // (window as any).c = c;
  // (window as any).p = p;

  // const a = await c.kthMostRecent(0);
  // console.log(a);
  // a.resultTotalMs += 1;
  // delete a.penalties;
  // s.update(a);
});
