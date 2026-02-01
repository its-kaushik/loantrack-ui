import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'loantrack-offline';
const DB_VERSION = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  key: string;
  data: unknown;
  cachedAt: number;
}

const STORES = ['dashboardCache', 'loanCache', 'customerCache'] as const;
type StoreName = (typeof STORES)[number];

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'key' });
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function getCached<T>(store: StoreName, key: string): Promise<T | null> {
  try {
    const db = await getDB();
    const entry = await db.get(store, key) as CacheEntry | undefined;
    if (!entry) return null;
    if (Date.now() - entry.cachedAt > MAX_AGE_MS) {
      await db.delete(store, key);
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export async function setCache(store: StoreName, key: string, data: unknown): Promise<void> {
  try {
    const db = await getDB();
    const entry: CacheEntry = { key, data, cachedAt: Date.now() };
    await db.put(store, entry);
  } catch {
    // Silently fail — offline cache is best-effort
  }
}

export async function purgeExpired(): Promise<void> {
  try {
    const db = await getDB();
    const now = Date.now();
    for (const store of STORES) {
      const tx = db.transaction(store, 'readwrite');
      let cursor = await tx.store.openCursor();
      while (cursor) {
        const entry = cursor.value as CacheEntry;
        if (now - entry.cachedAt > MAX_AGE_MS) {
          await cursor.delete();
        }
        cursor = await cursor.continue();
      }
      await tx.done;
    }
  } catch {
    // Silently fail
  }
}
