const NAMESPACE = "code-sandbox";

function storage(): Storage | null {
  try {
    const candidate = globalThis.localStorage;
    const probe = `${NAMESPACE}:probe`;
    candidate.setItem(probe, "1");
    candidate.removeItem(probe);
    return candidate;
  } catch {
    return null;
  }
}

export function readStored<T>(key: string, fallback: T, guard?: (value: unknown) => value is T): T {
  const store = storage();

  if (!store) {
    return fallback;
  }

  const raw = store.getItem(`${NAMESPACE}:${key}`);

  if (raw === null) {
    return fallback;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (guard && !guard(parsed)) {
      return fallback;
    }

    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeStored(key: string, value: unknown): void {
  const store = storage();

  if (!store) {
    return;
  }

  try {
    store.setItem(`${NAMESPACE}:${key}`, JSON.stringify(value));
  } catch {
    return;
  }
}
