const STORAGE_KEY = "entities_adslots";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export const AdSlot = {
  async list(sortBy = null) {
    const items = load();
    if (sortBy) {
      const desc = sortBy.startsWith('-');
      const key = desc ? sortBy.slice(1) : sortBy;
      items.sort((a, b) => {
        if (a[key] > b[key]) return desc ? -1 : 1;
        if (a[key] < b[key]) return desc ? 1 : -1;
        return 0;
      });
    }
    return items;
  },

  async get(id) {
    return load().find((item) => item.id === id) || null;
  },

  async create(data) {
    const items = load();
    const newItem = {
      id: generateId(),
      active: true,
      internal: false,
      accent: '#f59e0b',
      bg: 'from-slate-700 to-slate-900',
      ...data,
      created_date: new Date().toISOString(),
    };
    items.push(newItem);
    save(items);
    return newItem;
  },

  async update(id, data) {
    const items = load();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) throw new Error("AdSlot not found");
    items[index] = { ...items[index], ...data };
    save(items);
    return items[index];
  },

  async delete(id) {
    const items = load().filter((item) => item.id !== id);
    save(items);
  },

  async listActive() {
    return load().filter((item) => item.active !== false);
  },
};