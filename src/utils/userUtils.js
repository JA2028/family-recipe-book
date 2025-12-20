import { storage, generateId } from './storage.js';

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

/**
 * Get all users
 * @returns {Promise<Array>}
 */
export async function getAllUsers() {
  const keys = await storage.list('users:');
  const users = [];
  
  for (const key of keys) {
    const user = await storage.get(key);
    if (user) {
      users.push(user);
    }
  }
  
  return users;
}

/**
 * Get current active user
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  return await storage.get('current_user');
}

/**
 * Set current active user
 * @param {Object} user
 * @returns {Promise<void>}
 */
export async function setCurrentUser(user) {
  await storage.set('current_user', user);
}

/**
 * Create a new user
 * @param {string} name
 * @returns {Promise<Object>}
 */
export async function createUser(name) {
  const userId = generateId('user');
  const users = await getAllUsers();
  const colorIndex = users.length % USER_COLORS.length;
  
  const user = {
    id: userId,
    name,
    color: USER_COLORS[colorIndex],
    created: new Date().toISOString()
  };
  
  await storage.set(`users:${userId}`, user);
  
  return user;
}

/**
 * Get a user by ID
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
export async function getUser(userId) {
  return await storage.get(`users:${userId}`);
}
