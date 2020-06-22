# `timer-db`

A JavaScript cubing timer database, with:

- An API designed for cubing timers.
- Fast local storage (works offline).
- Simple server sync (using [PouchDB](https://pouchdb.com/)).

# Basic Usage

Install with `npm install timer-db` and use like this:

```js
import { TimerDB } from "timer-db";

async function demo() {
  const timerDB = new TimerDB();
  const sessions = await timerDB.getSessions();

  // Use an existing session, or create a new one.
  const s =
    sessions[0] ?? (await timerDB.createSession("My 3x3x3 Solves", "3x3x3"));

  s.addStatListener(console.log);
  s.add({
    totalResultMs: 7080,
    unixDate: Date.now(),
  });
}

demo();
```

## Sync with Server

```js
timerDB.startSync({
  username: "[username]",
  password: "[password]",
});
```

You can use this with any CouchDB-compatible instance. There's a test server available; Contact [Lucas Garron](https://garron.net/) for an account!

## License

This project is licensed under the GPL license (version 3 or later). This means that this library is **free to use**, although you **must publish any code that uses it** (e.g. also put it on GitHub). See [the full license](./LICENSE.md) for exact details.

We've selected this license in order to encourage the cubing community to work on software in a way so that everyone can contribute and extend each other's work.
