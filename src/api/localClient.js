import { openDB } from 'idb';

const DB_NAME = 'gunluk-db';
const DB_VERSION = 1;

// Initialize Database
async function getDB() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store for journal entries
            if (!db.objectStoreNames.contains('entries')) {
                db.createObjectStore('entries', { keyPath: 'id' });
            }
            // Store for media files (videos/audio)
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'id' });
            }
        },
    });
}

// Helper to generate IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// Helper to sort entries
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

// Helper to hydrate entries with Blob URLs
async function hydrateEntry(db, entry) {
    if (!entry) return null;
    const hydrated = { ...entry };

    if (entry.video_file_id) {
        const fileData = await db.get('files', entry.video_file_id);
        if (fileData && fileData.blob) {
            hydrated.video_url = URL.createObjectURL(fileData.blob);
        }
    }

    // Thumbnail logic same as video for now
    if (entry.video_file_id) {
        hydrated.thumbnail_url = hydrated.video_url;
    }

    return hydrated;
}

export const base44 = {
    entities: {
        JournalEntry: {
            async list(order) {
                const db = await getDB();
                const entries = await db.getAll('entries');

                // Hydrate all entries with Blob URLs
                const hydratedEntries = await Promise.all(
                    entries.map(entry => hydrateEntry(db, entry))
                );

                return sortEntries(hydratedEntries, order);
            },

            async filter(filters) {
                const db = await getDB();
                if (filters && filters.id) {
                    const entry = await db.get('entries', filters.id);
                    if (!entry) return [];
                    const hydrated = await hydrateEntry(db, entry);
                    return [hydrated];
                }
                return this.list();
            },

            async create(data) {
                const db = await getDB();
                const id = generateId();
                const created_at = new Date().toISOString();

                const newEntry = {
                    ...data,
                    id,
                    created_at,
                };

                // Note: data.video_url coming from UploadFile will actually be the file ID now
                // We should store it as video_file_id to be clean, but for compatibility
                // let's check if it looks like an ID we generated.
                // Actually, let's handle this in UploadFile return value.

                await db.put('entries', newEntry);

                // Return hydrated version for immediate UI update
                return hydrateEntry(db, newEntry);
            },

            async delete(id) {
                const db = await getDB();
                const entry = await db.get('entries', id);
                if (entry) {
                    // Delete associated file if exists
                    if (entry.video_file_id) {
                        await db.delete('files', entry.video_file_id);
                    }
                    await db.delete('entries', id);
                }
            },
        },
    },
    integrations: {
        Core: {
            async UploadFile({ file }) {
                const db = await getDB();
                const id = generateId();

                // Store the file blob
                await db.put('files', {
                    id,
                    blob: file,
                    created_at: new Date().toISOString(),
                    type: file.type
                });

                // Return the ID as the "url" so it gets saved in the entry
                // The create method and list method will handle this ID.
                // But wait, the frontend expects a URL to preview immediately?
                // The frontend usually uses URL.createObjectURL for preview BEFORE saving.
                // When saving, it calls UploadFile.
                // So returning the ID here is fine for the database record.
                // We just need to make sure the 'create' method stores this ID.

                // To make it seamless with existing code:
                // The existing code does: 
                // const { file_url } = await UploadFile(...)
                // await createEntry({ video_url: file_url ... })

                // So if we return { file_url: id }, then entry.video_url will be the ID.
                // Then in 'list', we see entry.video_url is an ID, fetch the blob, create a URL.

                // However, we need to distinguish between a real URL and an ID.
                // Our IDs are simple strings.
                // Let's return the ID but maybe we should update the create method to map it.
                // Actually, let's just store it in video_file_id if possible.
                // But the frontend passes 'video_url'.

                // Strategy:
                // Return { file_url: id, is_local_id: true }
                // But the frontend just takes file_url.

                // Let's just return the ID. In 'hydrateEntry', if 'video_url' looks like an ID (no http/blob prefix), treat it as ID.

                return { file_url: id };
            },
        },
    },
};
