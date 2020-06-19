import { StoredAttempt, Attempt } from "./Attempt";
import { StoredSessionMetadata, SessionMetadata } from "./SessionMetadata";

export function isValidAttemptData(attempt: Attempt): boolean {
  // We currently only support millisecond results.
  if (!("totalResultMs" in attempt)) {
    return false;
  }
  return true;
}

export function isValidStoredAttempt(attempt: StoredAttempt): boolean {
  if (!isValidAttemptData(attempt)) {
    return false;
  }
  // ID must contain the date.
  if (parseInt(attempt._id.slice(1, 13), 10) !== attempt.unixDate) {
    return false;
  }
  if (!("_rev" in attempt)) {
    return false;
  }
  return true;
}

export function isValidSessionMetadata(
  sessionMetadata: SessionMetadata
): boolean {
  if (!("name" in sessionMetadata)) {
    return false;
  }
  if (!("event" in sessionMetadata)) {
    return false;
  }
  return true;
}

export function isValidStoredSessionMetadata(
  storedSessionMetadata: StoredSessionMetadata
): boolean {
  if (!isValidSessionMetadata(storedSessionMetadata)) {
    return false;
  }
  if (!("_rev" in storedSessionMetadata)) {
    return false;
  }
  return true;
}
