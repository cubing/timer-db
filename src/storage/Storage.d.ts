import { StoredAttempt, Attempt } from "../data/Attempt";
import {
  SessionMetadata,
  StoredSessionMetadata,
} from "../data/SessionMetadata";
import { SessionUUID } from "../UUID";

export type SyncChangeListener = (attempt: StoredAttempt[]) => void;

declare interface Storage {
  connectRemoteDB(username: string, password: string): void;

  // Sessions
  createSession(
    sessionMetadata: SessionMetadata
  ): Promise<StoredSessionMetadata>;
  getAllSessions(): Promise<StoredSessionMetadata[]>;

  // Attempts
  addNewAttempt(attempt: Attempt): Promise<StoredAttempt>;
  updateAttempt(storedAttempt: StoredAttempt): Promise<void>;
  deleteAttempt(storedAttempt: StoredAttempt): Promise<void>;
  latestAttempts(sessionID: SessionUUID, n: number): Promise<StoredAttempt[]>;
  sessionNumAttempts(sessionID: SessionUUID): Promise<number>;

  // Listeners
  addListener(listener: SyncChangeListener): void;
  removeListener(listener: SyncChangeListener): void;
}
