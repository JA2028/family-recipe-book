/**
 * Storage utility wrapper using localStorage
 * Provides error handling and consistent interface for data persistence
 */

export const storage = {
  /**
   * Set a value in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be serialized)
   * @returns {Promise<void>}
   */
  async set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting storage key "${key}":`, error);
      throw new Error(`Failed to save data: ${error.message}`);
    }
  },

  /**
   * Get a value from storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {Promise<any>}
   */
  async get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error getting storage key "${key}":`, error);
      return defaultValue;
    }
  },

  /**
   * List all keys with a given prefix
   * @param {string} prefix - Key prefix to search for
   * @returns {Promise<string[]>}
   */
  async list(prefix) {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error(`Error listing storage keys with prefix "${prefix}":`, error);
      return [];
    }
  },

  /**
   * Delete a key from storage
   * @param {string} key - Storage key to delete
   * @returns {Promise<void>}
   */
  async delete(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error deleting storage key "${key}":`, error);
      throw new Error(`Failed to delete data: ${error.message}`);
    }
  }
};

/**
 * Generate a unique ID for recipes, users, comments, etc.
 * @param {string} prefix - Prefix for the ID (e.g., 'recipe', 'user', 'comment')
 * @returns {string}
 */
export function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Calculate average rating from ratings object
 * @param {Object} ratings - Object with userId keys and rating values
 * @returns {number}
 */
export function calculateAverageRating(ratings) {
  if (!ratings || Object.keys(ratings).length === 0) return 0;
  
  const values = Object.values(ratings);
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}