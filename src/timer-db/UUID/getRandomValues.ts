// From `random-uint-below`.

// Mangled so that bundlers don't try to inline the source.
const cryptoMangled = "cr-yp-to";
const cryptoUnmangled = () => cryptoMangled.replace(/-/g, "");

async function nodeGetRandomValues(arr: Uint8Array): Promise<Uint8Array> {
  if (!(arr instanceof Uint8Array)) {
    throw new Error(
      "The getRandomValues() shim only takes unsigned 32-bit int arrays"
    );
  }
  var bytes = (await import(/* @vite-ignore */ cryptoUnmangled())).randomBytes(
    arr.length
  );
  arr.set(bytes);
  return arr;
}

async function browserGetRandomValues(arr: Uint8Array): Promise<Uint8Array> {
  return crypto.getRandomValues(arr);
}

const inBrowser =
  typeof crypto !== "undefined" &&
  typeof crypto.getRandomValues !== "undefined";
export const getRandomValues: (arr: Uint8Array) => Promise<Uint8Array> =
  inBrowser ? browserGetRandomValues : nodeGetRandomValues;
