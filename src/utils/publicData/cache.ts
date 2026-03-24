import type { PublicDataEnvelope, PublicDataSnapshot } from "../../types/publicData";

const STORAGE_KEY = "liga_sportowa.public-data.v1";
const SCHEMA_VERSION = 1;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isArray = <T = unknown>(value: unknown): value is T[] => Array.isArray(value);

const hasSnapshotShape = (value: unknown): value is PublicDataSnapshot => {
  if (!isObject(value)) return false;

  return (
    isArray(value.teams) &&
    isArray(value.matches) &&
    isArray(value.players) &&
    isArray(value.firstStageGroups) &&
    isArray(value.secondStageGroups) &&
    isArray(value.finalStageMatches) &&
    isArray(value.topScorers) &&
    isArray(value.navigationSettings)
  );
};

const migrateEnvelope = (raw: unknown): PublicDataEnvelope | null => {
  if (!isObject(raw)) return null;

  if (
    raw.version === SCHEMA_VERSION &&
    typeof raw.fetchedAt === "string" &&
    typeof raw.hash === "string" &&
    hasSnapshotShape(raw.data)
  ) {
    return {
      version: raw.version,
      fetchedAt: raw.fetchedAt,
      hash: raw.hash,
      data: raw.data,
    };
  }

  // Migration fallback: old payloads may store snapshot directly.
  if (hasSnapshotShape(raw)) {
    const snapshot = raw as PublicDataSnapshot;
    return {
      version: SCHEMA_VERSION,
      fetchedAt: new Date().toISOString(),
      hash: createSnapshotHash(snapshot),
      data: snapshot,
    };
  }

  // Migration fallback: old payloads may have { data } without explicit version.
  if (hasSnapshotShape(raw.data)) {
    const snapshot = raw.data;
    return {
      version: SCHEMA_VERSION,
      fetchedAt: typeof raw.fetchedAt === "string" ? raw.fetchedAt : new Date().toISOString(),
      hash: typeof raw.hash === "string" ? raw.hash : createSnapshotHash(snapshot),
      data: snapshot,
    };
  }

  return null;
};

const normalizeForHash = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => normalizeForHash(entry));
  }

  if (isObject(value)) {
    const normalized: Record<string, unknown> = {};
    Object.keys(value)
      .sort()
      .forEach((key) => {
        normalized[key] = normalizeForHash(value[key]);
      });
    return normalized;
  }

  return value;
};

const hashString = (input: string): string => {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return `h${(hash >>> 0).toString(16)}`;
};

export const createSnapshotHash = (snapshot: PublicDataSnapshot): string => {
  const normalized = normalizeForHash(snapshot);
  return hashString(JSON.stringify(normalized));
};

export const buildEnvelope = (
  snapshot: PublicDataSnapshot,
  fetchedAt: string
): PublicDataEnvelope => ({
  version: SCHEMA_VERSION,
  fetchedAt,
  hash: createSnapshotHash(snapshot),
  data: snapshot,
});

export const loadPublicDataFromStorage = (): PublicDataEnvelope | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    const migrated = migrateEnvelope(parsed);

    if (!migrated) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (!hasSnapshotShape(migrated.data)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return migrated;
  } catch (error) {
    console.error("Failed to read public data cache:", error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const savePublicDataToStorage = (envelope: PublicDataEnvelope): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (error) {
    console.error("Failed to persist public data cache:", error);
  }
};

export const clearPublicDataCache = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
