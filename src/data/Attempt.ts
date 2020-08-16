// This should be a `.d.ts` file, but we need to make it `.ts` (or Parcel won't include it in the output).

import { AttemptUUID } from "../UUID";

type AlgString = string;
export type EventName = string;

// Result in milliseconds
// TODO: Special values:
// -1: DNF
// -2: DNS
type AttemptResultMs = number;

// An *attempt* starts when the competitor starts inspection and ends when they confirm the result.
// A *solve* is the portion of an attempt when the timer is running.
export interface Attempt {
  // Total result *including* penalties, rounded to the nearest millisecond.
  resultTotalMs: AttemptResultMs;
  resultMoveCount: number;
  resultMultiScore: number;
  // TODO: other results formats like FMC, multi blind. (Can these all be handled using "poins"?)

  // Unix date of the solve, in milliseconds.
  // Ideally, this date represents the end of the solve (the moment when the timer stopped).
  // TODO: Add a revision date?
  unixDate: number;
  event?: EventName;
  sessionID?: string;
  scramble?: AlgString;

  // Arbitrary user-provided comment.
  comment?: string; // TODO
  solution?: AlgString; // TODO
  penalties?: Penalty[]; // TODO

  device?: string;
}

export interface StoredAttempt extends Attempt {
  // Globally unique, unpredictable identifier.
  // Must be unique across all attempts everywhere, ever.
  _id: AttemptUUID;
  _rev: string;
  _deleted?: boolean;
}

// TODO: Use strings instead?
type PenaltyReason =
  | "unsolved" // https://www.worldcubeassociation.org/regulations/#9f4
  | "misaligned" // https://www.worldcubeassociation.org/regulations/#10e3
  | "unknown-penalty";

export interface Penalty {
  // Number of milliseconds that the penalty added to the result.
  // TODO: Represent DNF penalty. (And maybe DNS?)
  ms?: number;
  reason?: PenaltyReason;
}
