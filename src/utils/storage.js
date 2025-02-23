const CACHE_KEYS = {
  FOOD_ENTRIES: 'fitbites_food_entries',
  CACHE_TIMESTAMP: 'fitbites_cache_timestamp',
};

// Cache duration in milliseconds (e.g., 5 minutes)
const CACHE_DURATION = 1 * 60 * 1000;

export const storage = {
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  clearCache() {
    Object.values(CACHE_KEYS).forEach(key => localStorage.removeItem(key));
  }
};

export { CACHE_KEYS, CACHE_DURATION }; 