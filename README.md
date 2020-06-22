# `timer-db`

A JavaScript cubing timer database, with robust support for working offline as well as syncing using [PouchDB](https://pouchdb.com/).

You can use this with any CouchDB-compatible instance. Contact [Lucas Garron](https://garron.net/) for an account with the test server!

# Basic Usage

```js
import { TimerDB } from "timer-db";

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

// Optional: sync with server.
timerDB.startSync({
  username: "[username]",
  password: "[password]",
});
```

## License

This project is licensed under the GPL license (version 3 or later). This means that this library is **free to use**, although you **must publish any code that uses it** (e.g. also put it on GitHub). See [the full license](./LICENSE.md) for exact details.

We've selected this license in order to encourage the cubing community to work on software in a way so that everyone can contribute and extend each other's work.
