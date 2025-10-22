import rawDefaultRecords from "@/data/tamagotchis.json";

export interface TamagochiRecord {
  name: string;
  createdAt: string;
}

type TamagochiRecordLike = {
  name?: unknown;
  createdAt?: unknown;
};

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

const STORAGE_KEY = "__tamagochi_state__" as const;

type GlobalTamagochiState = {
  records: TamagochiRecord[];
};

type GlobalTamagochiScope = typeof globalThis & {
  [STORAGE_KEY]?: GlobalTamagochiState;
};

const cloneRecords = (records: TamagochiRecord[]): TamagochiRecord[] =>
  records.map((record) => ({ ...record }));

const getGlobalScope = () => globalThis as GlobalTamagochiScope;

const ensureState = (): GlobalTamagochiState => {
  const scope = getGlobalScope();

  if (!scope[STORAGE_KEY]) {
    scope[STORAGE_KEY] = {
      records: cloneRecords(DEFAULT_TAMAGOTCHIS),
    };

    return scope[STORAGE_KEY]!;
  }

  const sanitised = sanitiseRecords(scope[STORAGE_KEY]!.records);

  if (sanitised.length === 0) {
    scope[STORAGE_KEY]!.records = cloneRecords(DEFAULT_TAMAGOTCHIS);
  } else {
    scope[STORAGE_KEY]!.records = sanitised;
  }

  return scope[STORAGE_KEY]!;
};

const commitRecords = (
  records: Iterable<TamagochiRecordLike>,
): TamagochiRecord[] => {
  const sanitised = sanitiseRecords(records);
  const scope = getGlobalScope();
  const nextRecords =
    sanitised.length > 0 ? sanitised : cloneRecords(DEFAULT_TAMAGOTCHIS);

  scope[STORAGE_KEY] = { records: nextRecords };

  return cloneRecords(nextRecords);
};

export const readTamagotchis = async (): Promise<TamagochiRecord[]> => {
  const state = ensureState();
  return cloneRecords(state.records);
};

export const registerTamagochi = async (
  name: string,
): Promise<TamagochiRecord[]> => {
  const trimmedName = normaliseName(name);

  if (!trimmedName) {
    return readTamagotchis();
  }

  const state = ensureState();
  const existingIndex = state.records.findIndex(
    (record) => comparisonKey(record.name) === comparisonKey(trimmedName),
  );

  if (existingIndex >= 0) {
    const existing = state.records[existingIndex]!;

    if (existing.name === trimmedName) {
      return cloneRecords(state.records);
    }

    const updatedRecords = state.records.map((record, index) =>
      index === existingIndex ? { ...record, name: trimmedName } : record,
    );

    return commitRecords(updatedRecords);
  }

  const updatedRecords = [
    ...state.records,
    { name: trimmedName, createdAt: new Date().toISOString() },
  ];

  return commitRecords(updatedRecords);
};

export { comparisonKey, normaliseName };
