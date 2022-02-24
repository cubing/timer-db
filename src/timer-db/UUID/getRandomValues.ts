// From `random-uint-below`.

async function nodeGetRandomValues(arr: Uint8Array): Promise<Uint8Array> {
  if (!(arr instanceof Uint8Array)) {
    throw new Error(
      "The getRandomValues() shim only takes unsigned 32-bit int arrays"
    );
  }
  var bytes = (await import("./crypto")).randomBytes(arr.length);
  arr.set(bytes);
  return arr;
}

async function browserGetRandomValues(arr: Uint8Array): Promise<Uint8Array> {
  return crypto.getRandomValues(arr);
}

const inBrowser =
  typeof crypto !== "undefined" &&
  typeof crypto.getRandomValues !== "undefined";
export const getRandomValues: (
  arr: Uint8Array
) => Promise<Uint8Array> = inBrowser
  ? browserGetRandomValues
  : nodeGetRandomValues;
