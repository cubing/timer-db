import { SessionUUID } from "../UUID";

export interface SessionMetadata {
  name: string;
  // TODO: How should we handle heterogeneous sessions from older times?
  eventID: string;
}

export interface StoredSessionMetadata extends SessionMetadata {
  _id: SessionUUID;
  _rev: string;
}
