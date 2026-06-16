const STORAGE_KEY = "entities_app_settings";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const DEFAULTS = {
  virtualExhibitionOpen: false,
};

export const AppSettings = {
  async get() {
    return { ...DEFAULTS, ...load() };
  },
  async update(data) {
    const updated = { ...DEFAULTS, ...load(), ...data };
    save(updated);
    return updated;
  },
};