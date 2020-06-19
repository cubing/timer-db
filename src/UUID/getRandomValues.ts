// From `random-uint-below`.

function nodeGetRandomValues(arr: Uint8Array): Uint8Array {
  if (!(arr instanceof Uint8Array)) {
    throw new Error(
      "The getRandomValues() shim only takes unsigned 32-bit int arrays"
    );
  }
  var bytes = require("crypto").randomBytes(arr.length);
  arr.set(bytes);
  return arr;
}

function browserGetRandomValues(arr: Uint8Array): Uint8Array {
  return crypto.getRandomValues(arr);
}

const inBrowser =
  typeof crypto !== "undefined" &&
  typeof crypto.getRandomValues !== "undefined";
export const getRandomValues: (arr: Uint8Array) => Uint8Array = inBrowser
  ? browserGetRandomValues
  : nodeGetRandomValues;
