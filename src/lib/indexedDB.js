import { openDB } from 'idb';

const dbPromise = openDB('taskFormDB', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('drafts')) {
      db.createObjectStore('drafts', { keyPath: 'id' });
    }
  },
});

export async function saveDraft(id, data) {
  const db = await dbPromise;
  await db.put('drafts', { id, ...data });
}

export async function loadDraftFromIndexed(id) {
  const db = await dbPromise;
  return await db.get('drafts', id);
}

export async function deleteDraft(id) {
  const db = await dbPromise;
  await db.delete('drafts', id);
}

