import rawDefaultRecords from "@/data/tamagotchis.json";

export interface TamagochiRecord {
  name: string;
  createdAt: string;
}

type TamagochiRecordLike = {
  name?: unknown;
  createdAt?: unknown;
};

export interface TamagochiBindings {
  TAMAGOCHI_KV: KVNamespace;
}

const normaliseName = (value: string) => value.trim();

const comparisonKey = (value: string) =>
  normaliseName(value).toLocaleLowerCase("hu-HU");

const sortRecords = (records: TamagochiRecord[]): TamagochiRecord[] =>
  [...records].sort((first, second) =>
    Date.parse(first.createdAt) - Date.parse(second.createdAt),
  );

const sanitiseRecords = (
  records: Iterable<TamagochiRecordLike>,
): TamagochiRecord[] => {
  const sanitised: TamagochiRecord[] = [];

  for (const entry of records) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as TamagochiRecordLike;

    if (typeof candidate.name !== "string" || typeof candidate.createdAt !== "string") {
      continue;
    }

    const trimmedName = normaliseName(candidate.name);
    const parsedTime = Date.parse(candidate.createdAt);

    if (!trimmedName || Number.isNaN(parsedTime)) {
      continue;
    }

    sanitised.push({
      name: trimmedName,
      createdAt: new Date(parsedTime).toISOString(),
    });
  }

  if (sanitised.length === 0) {
    return sanitised;
  }

  return sortRecords(sanitised);
};

const FALLBACK_TAMAGOTCHIS = sanitiseRecords([
  { name: "Pixel Panni", createdAt: "2024-01-12T08:30:00.000Z" },
  { name: "Render Róka", createdAt: "2023-11-03T18:15:00.000Z" },
  { name: "Synth Sanyi", createdAt: "2024-03-22T10:05:00.000Z" },
]);

const parseDefaultRecords = (): TamagochiRecord[] => {
  const dataset = rawDefaultRecords as unknown;

  if (!Array.isArray(dataset)) {
    return FALLBACK_TAMAGOTCHIS;
  }

  const parsed = sanitiseRecords(dataset as Iterable<TamagochiRecordLike>);

  if (parsed.length === 0) {
    return FALLBACK_TAMAGOTCHIS;
  }

  return parsed;
};

const DEFAULT_TAMAGOTCHIS = parseDefaultRecords();

const MEMORY_STORAGE_KEY = "__tamagochi_memory_state__" as const;
const KV_STORAGE_KEY = "tamagochi:records" as const;

type MemoryScope = typeof globalThis & {
  [MEMORY_STORAGE_KEY]?: TamagochiRecord[];
};

const cloneRecords = (records: TamagochiRecord[]): TamagochiRecord[] =>
  records.map((record) => ({ ...record }));

const getMemoryScope = () => globalThis as MemoryScope;

const readFromMemory = (): TamagochiRecord[] => {
  const scope = getMemoryScope();

  if (!scope[MEMORY_STORAGE_KEY]) {
    scope[MEMORY_STORAGE_KEY] = cloneRecords(DEFAULT_TAMAGOTCHIS);
  } else {
    const sanitised = sanitiseRecords(scope[MEMORY_STORAGE_KEY]!);
    scope[MEMORY_STORAGE_KEY] =
      sanitised.length > 0 ? sanitised : cloneRecords(DEFAULT_TAMAGOTCHIS);
  }

  return cloneRecords(scope[MEMORY_STORAGE_KEY]!);
};

const writeToMemory = (
  records: Iterable<TamagochiRecordLike>,
): TamagochiRecord[] => {
  const sanitised = sanitiseRecords(records);
  const scope = getMemoryScope();
  const nextRecords = sanitised.length > 0 ? sanitised : cloneRecords(DEFAULT_TAMAGOTCHIS);

  scope[MEMORY_STORAGE_KEY] = nextRecords;

  return cloneRecords(nextRecords);
};

const readFromKv = async (
  bindings: TamagochiBindings,
): Promise<TamagochiRecord[]> => {
  const stored = await bindings.TAMAGOCHI_KV.get<TamagochiRecordLike[]>(KV_STORAGE_KEY, {
    type: "json",
  });

  if (!Array.isArray(stored)) {
    const fallback = cloneRecords(DEFAULT_TAMAGOTCHIS);
    await bindings.TAMAGOCHI_KV.put(KV_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  const sanitised = sanitiseRecords(stored);

  if (sanitised.length === 0) {
    const fallback = cloneRecords(DEFAULT_TAMAGOTCHIS);
    await bindings.TAMAGOCHI_KV.put(KV_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }

  if (sanitised.length !== stored.length) {
    await bindings.TAMAGOCHI_KV.put(KV_STORAGE_KEY, JSON.stringify(sanitised));
  }

  return cloneRecords(sanitised);
};

const writeToKv = async (
  records: Iterable<TamagochiRecordLike>,
  bindings: TamagochiBindings,
): Promise<TamagochiRecord[]> => {
  const sanitised = sanitiseRecords(records);
  const nextRecords = sanitised.length > 0 ? sanitised : cloneRecords(DEFAULT_TAMAGOTCHIS);

  await bindings.TAMAGOCHI_KV.put(KV_STORAGE_KEY, JSON.stringify(nextRecords));

  return cloneRecords(nextRecords);
};

const resolveRecords = async (
  bindings?: Partial<TamagochiBindings>,
): Promise<TamagochiRecord[]> => {
  if (bindings?.TAMAGOCHI_KV) {
    return readFromKv(bindings as TamagochiBindings);
  }

  return readFromMemory();
};

const persistRecords = async (
  records: Iterable<TamagochiRecordLike>,
  bindings?: Partial<TamagochiBindings>,
): Promise<TamagochiRecord[]> => {
  if (bindings?.TAMAGOCHI_KV) {
    return writeToKv(records, bindings as TamagochiBindings);
  }

  return writeToMemory(records);
};

export const readTamagotchis = async (
  bindings?: Partial<TamagochiBindings>,
): Promise<TamagochiRecord[]> => resolveRecords(bindings);

export const registerTamagochi = async (
  name: string,
  bindings?: Partial<TamagochiBindings>,
): Promise<TamagochiRecord[]> => {
  const trimmedName = normaliseName(name);

  if (!trimmedName) {
    return resolveRecords(bindings);
  }

  const records = await resolveRecords(bindings);
  const existingIndex = records.findIndex(
    (record) => comparisonKey(record.name) === comparisonKey(trimmedName),
  );

  if (existingIndex >= 0) {
    const existing = records[existingIndex]!;

    if (existing.name === trimmedName) {
      return cloneRecords(records);
    }

    const updatedRecords = records.map((record, index) =>
      index === existingIndex ? { ...record, name: trimmedName } : record,
    );

    return persistRecords(updatedRecords, bindings);
  }

  const updatedRecords = [
    ...records,
    { name: trimmedName, createdAt: new Date().toISOString() },
  ];

  return persistRecords(updatedRecords, bindings);
};

export const removeTamagochi = async (
  name: string,
  bindings?: Partial<TamagochiBindings>,
): Promise<TamagochiRecord[]> => {
  const trimmedName = normaliseName(name);

  if (!trimmedName) {
    return resolveRecords(bindings);
  }

  const records = await resolveRecords(bindings);
  const remaining = records.filter(
    (record) => comparisonKey(record.name) !== comparisonKey(trimmedName),
  );

  return persistRecords(remaining, bindings);
};

export { comparisonKey, normaliseName };
