const STORAGE_KEY = "entities_virtual_enquiries";

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

export const VirtualEnquiry = {
  async list(sortBy = null) {
    const items = load();
    if (sortBy) {
      const desc = sortBy.startsWith("-");
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
      status: "New",
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
    if (index === -1) throw new Error("VirtualEnquiry not found");
    items[index] = { ...items[index], ...data };
    save(items);
    return items[index];
  },

  async delete(id) {
    const items = load().filter((item) => item.id !== id);
    save(items);
  },

  async filter(query = {}) {
    const items = load();
    return items.filter((item) =>
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
  },
};