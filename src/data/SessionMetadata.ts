import { SessionUUID } from "../UUID";

export interface SessionMetadata {
  name: string;
  // How should we handle homogeneous sessions from older times?
  event: string;
}

export interface StoredSessionMetadata extends SessionMetadata {
  _id: SessionUUID;
  _rev: string;
}
