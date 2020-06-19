import { StoredAttempt, Attempt } from "../data/Attempt";
import {
  SessionMetadata,
  StoredSessionMetadata,
} from "../data/SessionMetadata";

export type SyncChangeListener = (attempt: StoredAttempt[]) => void;

declare interface Storage {
  constructor();
  connectRemoteDB(username: string, password: string): void;

  // Sessions
  createSession(
    sessionMetadata: SessionMetadata
  ): Promise<StoredSessionMetadata>;
  getAllSessions(): Promise<StoredSessionMetadata[]>;

  // Attempts
  addNewAttempt(attempt: Attempt): Promise<StoredAttempt>;
  deleteAttempt(storedAttempt: StoredAttempt): Promise<void>;
  latestAttempts(
    session: StoredSessionMetadata,
    n: number
  ): Promise<StoredAttempt[]>;

  // Listeners
  addListener(listener: SyncChangeListener): void;
  removeListener(listener: SyncChangeListener): void;
}
