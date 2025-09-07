import { useEffect, useMemo, useRef, useState } from "react";

type InitialValue<T> = T | (() => T);

export type UseLocalStorageOptions<T> = {
  key: string;
  initialValue: InitialValue<T>;
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
  storage?: Storage; // defaults to window.localStorage
  syncTabs?: boolean; // listen to `storage` events, default true
};

/**
 * React hook for reading/writing localStorage with type safety and tab sync.
 *
 * Example:
 * const [user, setUser, { remove }] = useLocalStorage<User>({ key: 'user', initialValue: null });
 */
export function useLocalStorage<T>({
  key,
  initialValue,
  serialize = JSON.stringify,
  deserialize = JSON.parse as (raw: string) => T,
  storage,
  syncTabs = true,
}: UseLocalStorageOptions<T>) {
  const isBrowser = typeof window !== "undefined";
  const store = storage ?? (isBrowser ? window.localStorage : undefined);

  const getInitial = (): T => {
    const fallback = typeof initialValue === "function"
      ? (initialValue as () => T)()
      : (initialValue as T);
    if (!store) return fallback;
    try {
      const raw = store.getItem(key);
      return raw == null ? fallback : (deserialize(raw) as T);
    } catch {
      return fallback;
    }
  };

  const [value, setValue] = useState<T>(getInitial);

  const prevKeyRef = useRef(key);
  const lastWriteRef = useRef<string | null>(null);

  // Write changes to storage
  useEffect(() => {
    if (!store) return;
    // Clean up old key if it changed
    if (prevKeyRef.current !== key) {
      try {
        store.removeItem(prevKeyRef.current);
      } catch {}
      prevKeyRef.current = key;
    }
    try {
      const raw = serialize(value);
      store.setItem(key, raw);
      lastWriteRef.current = raw;
    } catch {
      // ignore write errors (quota, serialization, etc.)
    }
  }, [key, serialize, store, value]);

  // Sync across tabs
  useEffect(() => {
    if (!store || !isBrowser || !syncTabs) return;
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== store) return;
      if (e.key !== key) return;
      try {
        // Avoid echo from our own write on some browsers
        if (e.newValue != null && e.newValue === lastWriteRef.current) return;
        if (e.newValue == null) {
          setValue(() => (typeof initialValue === "function" ? (initialValue as () => T)() : (initialValue as T)));
        } else {
          setValue(deserialize(e.newValue));
        }
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [store, key, deserialize, initialValue, syncTabs, isBrowser]);

  // Stable setter that accepts value or updater fn
  const set = useMemo(
    () =>
      (updater: T | ((prev: T) => T)) => {
        setValue((prev) => (typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater));
      },
    []
  );

  const remove = useMemo(
    () => () => {
      if (!store) return;
      try {
        store.removeItem(key);
      } catch {}
      setValue(() => (typeof initialValue === "function" ? (initialValue as () => T)() : (initialValue as T)));
    },
    [key, store, initialValue]
  );

  return [value, set, { remove }] as const;
}

