import { Attempt } from "./data/Attempt";

function compareNumbers(a: Attempt, b: Attempt): number {
  return a.resultTotalMs - b.resultTotalMs;
}

// TODO: handle DNFs
export function mean(attempts: Attempt[]): number | null {
  if (attempts.length < 1) {
    return null;
  }
  var total = 0;
  for (const attempt of attempts) {
    total += attempt.resultTotalMs;
  }
  return Math.round(total / attempts.length);
}

// TODO: handle incomplete avg (e.g. 4 attempts for an avg of 5).
// TODO: handle DNFs
export function trimmedAverage(attempts: Attempt[]): number | null {
  if (attempts.length < 3) {
    return null;
  }

  var sorted = attempts.sort(compareNumbers);
  const trimFromEachEnd = Math.ceil(sorted.length / 20);
  const middle = sorted.slice(trimFromEachEnd, sorted.length - trimFromEachEnd);

  return mean(middle);
}

// TODO: handle DNFs
export function best(attempts: Attempt[]): number | null {
  if (attempts.length < 1) {
    return null;
  }
  return Math.min.apply(
    this,
    attempts.map((attempt) => attempt.resultTotalMs)
  );
}

// TODO: handle DNF
export function worst(attempts: Attempt[]): number | null {
  if (attempts.length < 1) {
    return null;
  }
  return Math.max.apply(
    this,
    attempts.map((attempt) => attempt.resultTotalMs)
  );
}

export function formatTime(
  attempt: Attempt,
  decimalDigits: 0 | 1 | 2 | 3 = 2
): string {
  var hours = Math.floor(attempt.resultTotalMs / (60 * 60 * 1000));
  var minutes = Math.floor(attempt.resultTotalMs / (60 * 1000)) % 60;
  var seconds = Math.floor(attempt.resultTotalMs / 1000) % 60;
  var ms = Math.floor(attempt.resultTotalMs % 1000);

  let preDecimal: string;
  if (hours > 0) {
    preDecimal = [
      hours.toString(),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0"),
    ].join(":");
  } else if (minutes > 0) {
    preDecimal = [minutes.toString(), seconds.toString().padStart(2, "0")].join(
      ":"
    );
  } else {
    preDecimal = seconds.toString();
  }

  if (decimalDigits === 0) {
    return preDecimal;
  }

  return [
    preDecimal,
    ms.toString().padStart(3, "0").slice(0, decimalDigits),
  ].join(".");
}
