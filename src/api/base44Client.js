const STORAGE_KEY = "journal_entries";

function loadEntries() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load entries from localStorage", e);
    return [];
  }
}

function saveEntries(entries) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error("Failed to save entries to localStorage", e);
    throw e;
  }
}

let entriesCache = loadEntries();

function sortEntries(entries, order) {
  if (!order) return entries;
  if (order === "-date") {
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  }
  if (order === "date") {
    return [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));
  }
  return entries;
}

function generateId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const base44 = {
  entities: {
    JournalEntry: {
      async list(order) {
        entriesCache = loadEntries();
        return sortEntries(entriesCache, order);
      },
      async filter(filters) {
        entriesCache = loadEntries();
        if (filters && filters.id) {
          return entriesCache.filter((entry) => entry.id === filters.id);
        }
        return entriesCache;
      },
      async create(data) {
        entriesCache = loadEntries();
        const entry = { id: generateId(), ...data };
        entriesCache.push(entry);
        saveEntries(entriesCache);
        return entry;
      },
      async update(id, data) {
        entriesCache = loadEntries();
        let updatedEntry = null;
        entriesCache = entriesCache.map((entry) => {
          if (entry.id === id) {
            updatedEntry = { ...entry, ...data };
            return updatedEntry;
          }
          return entry;
        });
        saveEntries(entriesCache);
        return updatedEntry;
      },
      async delete(id) {
        entriesCache = loadEntries();
        entriesCache = entriesCache.filter((entry) => entry.id !== id);
        saveEntries(entriesCache);
      },
    },
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        if (!file) {
          throw new Error("File is required");
        }
        const file_url = await readFileAsDataUrl(file);
        return { file_url };
      },
    },
    AI: {
      async AnalyzeFile({ file_url, type }) {
        if (!file_url) {
          throw new Error("file_url is required for analysis");
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
        const analysis =
          type === "audio"
            ? "AI analysis for this audio will be shown here. Connect this to your real AI service."
            : "AI analysis for this media will be shown here. Connect this to your real AI service.";
        return { analysis };
      },
    },
  },
};
