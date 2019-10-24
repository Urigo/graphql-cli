export function collectHeaderObject(val: string, memo: Record<string, string>) {
  if (/^[^\:]+\:/i.test(val)) {
    const splitAt = val.indexOf(':');
    const key = val.substring(0, splitAt).trim();
    const value = val.substring(splitAt + 1).trim();

    memo[key] = value;
  }

  return memo;
}
