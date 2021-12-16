import { getRandomValues } from "./getRandomValues";

export function bufferToHex(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  return Array.prototype.slice
    .call(uint8Array)
    .map((x: number) => ("00" + x.toString(16)).slice(-2))
    .join("");
}

/******** AttemptUUID ********/

// Format: `a1576244980616-55804205`
// - `a` for attempt
// - Unix timestamp in milliseconds (represents the moment of the end of the solve)
//   - TODO: Do we need to future-proof this by storing it differently?
// - `-`

// - Random 8-digit value.
export type AttemptUUID = string;

const ATTEMPT_UUID_PREFIX = "a";

const attemptIDRegex = RegExp("a_[0-9]{14}_[0-9a-f]{8}");

export function isValidAttemptUUID(id: string): boolean {
  return attemptIDRegex.test(id);
}

export async function newAttemptUUID(date: number): Promise<AttemptUUID> {
  const paddedDate = date.toString().padStart(14, "0");
  const suffix = bufferToHex(await getRandomValues(new Uint8Array(4)));
  const uuid = `${ATTEMPT_UUID_PREFIX}_${paddedDate}_${suffix}`;
  if (!isValidAttemptUUID(uuid)) {
    throw new Error(
      `internal error: generated an invalid attempt UUID: ${uuid}`
    );
  }
  return uuid;
}

/******** SessionUUID ********/

export type SessionUUID = string;

const SESSION_UUID_PREFIX = "s";

const sessionIDRegex = RegExp("s_[0-9a-f]{8}");

function isValidSessionUUID(id: string): boolean {
  return sessionIDRegex.test(id);
}

export async function newSessionUUID(): Promise<SessionUUID> {
  const suffix = bufferToHex(await getRandomValues(new Uint8Array(8)));
  const uuid = `${SESSION_UUID_PREFIX}_${suffix}`;
  if (!isValidSessionUUID(uuid)) {
    throw new Error(
      `internal error: generated an invalid attempt UUID: ${uuid}`
    );
  }
  return uuid;
}
