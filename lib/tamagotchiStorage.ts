import { promises as fs } from "fs";
import { dirname, resolve } from "path";

export interface TamagochiRecord {
  name: string;
  createdAt: string;
}

const DATA_FILE_PATH = resolve(process.cwd(), "data", "tamagotchis.json");

const DEFAULT_TAMAGOTCHIS: TamagochiRecord[] = [
  { name: "Pixel Panni", createdAt: "2024-01-12T08:30:00.000Z" },
  { name: "Render Róka", createdAt: "2023-11-03T18:15:00.000Z" },
  { name: "Synth Sanyi", createdAt: "2024-03-22T10:05:00.000Z" },
];

const normaliseName = (value: string) => value.trim();

const comparisonKey = (value: string) =>
  normaliseName(value).toLocaleLowerCase("hu-HU");

const isValidRecord = (entry: unknown): entry is TamagochiRecord => {
  if (!entry || typeof entry !== "object") {
    return false;
  }

  const candidate = entry as Partial<TamagochiRecord>;

  if (typeof candidate.name !== "string" || typeof candidate.createdAt !== "string") {
    return false;
  }

  const normalisedName = normaliseName(candidate.name);
  const createdTime = Number.isNaN(Date.parse(candidate.createdAt))
    ? Number.NaN
    : Date.parse(candidate.createdAt);

  return normalisedName.length > 0 && Number.isFinite(createdTime);
};

const writeTamagotchis = async (records: TamagochiRecord[]) => {
  await fs.mkdir(dirname(DATA_FILE_PATH), { recursive: true });
  const sortedRecords = [...records].sort((a, b) => {
    const aTime = Date.parse(a.createdAt);
    const bTime = Date.parse(b.createdAt);
    return aTime - bTime;
  });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(sortedRecords, null, 2), "utf-8");
};

const ensureDataFile = async () => {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await writeTamagotchis(DEFAULT_TAMAGOTCHIS);
  }
};

const loadRecords = async () => {
  await ensureDataFile();

  try {
    const rawContent = await fs.readFile(DATA_FILE_PATH, "utf-8");
    const parsed: unknown = JSON.parse(rawContent);

    if (!Array.isArray(parsed)) {
      throw new Error("A tamagochi lista nem tömb formátumú.");
    }

    const records = parsed.filter(isValidRecord).map((entry) => ({
      name: normaliseName((entry as TamagochiRecord).name),
      createdAt: new Date((entry as TamagochiRecord).createdAt).toISOString(),
    }));

    if (records.length === 0) {
      throw new Error("Nincs érvényes tamagochi bejegyzés.");
    }

    return records;
  } catch {
    await writeTamagotchis(DEFAULT_TAMAGOTCHIS);
    return DEFAULT_TAMAGOTCHIS;
  }
};

export const readTamagotchis = async (): Promise<TamagochiRecord[]> => {
  const records = await loadRecords();
  return records;
};

export const registerTamagochi = async (name: string) => {
  const trimmedName = normaliseName(name);

  if (!trimmedName) {
    return await readTamagotchis();
  }

  const records = await loadRecords();

  const existingIndex = records.findIndex(
    (record) => comparisonKey(record.name) === comparisonKey(trimmedName),
  );

  if (existingIndex >= 0) {
    const existing = records[existingIndex]!;

    if (existing.name !== trimmedName) {
      records[existingIndex] = {
        ...existing,
        name: trimmedName,
      };
      await writeTamagotchis(records);
    }

    return records;
  }

  const newRecords = [
    ...records,
    { name: trimmedName, createdAt: new Date().toISOString() },
  ];

  await writeTamagotchis(newRecords);
  return newRecords;
};
