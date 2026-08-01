// ========================================
// BM Wedding Portal - Storage Helper
// ========================================

const Storage = {

    load(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (error) {
            console.error(`Error loading "${key}"`, error);
            return [];
        }
    },

    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    remove(key) {
        localStorage.removeItem(key);
    },

    clear() {
        localStorage.clear();
    }

};