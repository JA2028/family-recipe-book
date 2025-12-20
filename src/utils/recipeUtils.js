import { storage, generateId } from './storage.js';

/**
 * Get all recipes from storage
 * @returns {Promise<Array>}
 */
export async function getAllRecipes() {
  const index = await storage.get('recipe_index', []);
  const recipes = [];
  
  for (const recipeId of index) {
    const recipe = await storage.get(`recipes:${recipeId}`);
    if (recipe) {
      recipes.push(recipe);
    }
  }
  
  return recipes;
}

/**
 * Get a single recipe by ID
 * @param {string} recipeId
 * @returns {Promise<Object|null>}
 */
export async function getRecipe(recipeId) {
  return await storage.get(`recipes:${recipeId}`);
}

/**
 * Save a new recipe
 * @param {Object} recipeData
 * @returns {Promise<Object>} - The saved recipe with ID
 */
export async function createRecipe(recipeData) {
  const recipeId = generateId('recipe');
  const recipe = {
    ...recipeData,
    id: recipeId,
    dateAdded: new Date().toISOString(),
    lastMade: null
  };
  
  await storage.set(`recipes:${recipeId}`, recipe);
  
  // Update index
  const index = await storage.get('recipe_index', []);
  index.push(recipeId);
  await storage.set('recipe_index', index);
  
  return recipe;
}

/**
 * Update an existing recipe
 * @param {string} recipeId
 * @param {Object} updates
 * @returns {Promise<Object>} - The updated recipe
 */
export async function updateRecipe(recipeId, updates) {
  const existing = await storage.get(`recipes:${recipeId}`);
  if (!existing) {
    throw new Error('Recipe not found');
  }
  
  const updated = { ...existing, ...updates, id: recipeId };
  await storage.set(`recipes:${recipeId}`, updated);
  
  return updated;
}

/**
 * Delete a recipe
 * @param {string} recipeId
 * @returns {Promise<void>}
 */
export async function deleteRecipe(recipeId) {
  await storage.delete(`recipes:${recipeId}`);
  await storage.delete(`ratings:${recipeId}`);
  await storage.delete(`comments:${recipeId}`);
  await storage.delete(`photos:${recipeId}`);
  
  // Update index
  const index = await storage.get('recipe_index', []);
  const updatedIndex = index.filter(id => id !== recipeId);
  await storage.set('recipe_index', updatedIndex);
}

/**
 * Get ratings for a recipe
 * @param {string} recipeId
 * @returns {Promise<Object>}
 */
export async function getRatings(recipeId) {
  return await storage.get(`ratings:${recipeId}`, {});
}

/**
 * Set a user's rating for a recipe
 * @param {string} recipeId
 * @param {string} userId
 * @param {number} rating - 1-5
 * @returns {Promise<void>}
 */
export async function setRating(recipeId, userId, rating) {
  const ratings = await getRatings(recipeId);
  ratings[userId] = rating;
  await storage.set(`ratings:${recipeId}`, ratings);
}

/**
 * Get comments for a recipe
 * @param {string} recipeId
 * @returns {Promise<Array>}
 */
export async function getComments(recipeId) {
  return await storage.get(`comments:${recipeId}`, []);
}

/**
 * Add a comment to a recipe
 * @param {string} recipeId
 * @param {string} userId
 * @param {string} userName
 * @param {string} text
 * @returns {Promise<Object>} - The new comment
 */
export async function addComment(recipeId, userId, userName, text) {
  const comments = await getComments(recipeId);
  const comment = {
    id: generateId('comment'),
    userId,
    userName,
    text,
    date: new Date().toISOString()
  };
  
  comments.push(comment);
  await storage.set(`comments:${recipeId}`, comments);
  
  return comment;
}

/**
 * Get photos for a recipe
 * @param {string} recipeId
 * @returns {Promise<Array>}
 */
export async function getPhotos(recipeId) {
  return await storage.get(`photos:${recipeId}`, []);
}

/**
 * Add a photo to a recipe
 * @param {string} recipeId
 * @param {string} userId
 * @param {string} userName
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function addPhoto(recipeId, userId, userName, url) {
  const photos = await getPhotos(recipeId);
  photos.push({
    id: generateId('photo'),
    userId,
    userName,
    url,
    date: new Date().toISOString()
  });
  await storage.set(`photos:${recipeId}`, photos);
}

/**
 * Filter and search recipes
 * @param {Array} recipes - All recipes
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered recipes
 */
export function filterRecipes(recipes, filters = {}) {
  let filtered = [...recipes];
  
  // Search by name, ingredients, or author
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(recipe => {
      const nameMatch = recipe.name.toLowerCase().includes(search);
      const ingredientMatch = recipe.ingredients.some(ing => 
        ing.toLowerCase().includes(search)
      );
      const authorMatch = recipe.authorName?.toLowerCase().includes(search);
      return nameMatch || ingredientMatch || authorMatch;
    });
  }
  
  // Filter by categories
  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter(recipe => 
      filters.categories.some(cat => recipe.categories.includes(cat))
    );
  }
  
  // Filter by prep time
  if (filters.prepTime) {
    filtered = filtered.filter(recipe => {
      const time = recipe.prepTime + recipe.cookTime;
      switch (filters.prepTime) {
        case 'quick': return time < 15;
        case 'medium': return time >= 15 && time < 30;
        case 'long': return time >= 30 && time < 60;
        case 'verylong': return time >= 60;
        default: return true;
      }
    });
  }
  
  // Filter by author
  if (filters.authorId) {
    filtered = filtered.filter(recipe => recipe.authorId === filters.authorId);
  }
  
  return filtered;
}

/**
 * Sort recipes
 * @param {Array} recipes
 * @param {string} sortBy
 * @param {Object} ratingsMap - Map of recipeId to ratings
 * @returns {Array}
 */
export function sortRecipes(recipes, sortBy, ratingsMap = {}) {
  const sorted = [...recipes];
  
  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => 
        new Date(b.dateAdded) - new Date(a.dateAdded)
      );
    
    case 'rating':
      return sorted.sort((a, b) => {
        const avgA = calculateAvg(ratingsMap[a.id] || {});
        const avgB = calculateAvg(ratingsMap[b.id] || {});
        return avgB - avgA;
      });
    
    case 'alphabetical':
      return sorted.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
    
    case 'random':
      return sorted.sort(() => Math.random() - 0.5);
    
    default:
      return sorted;
  }
}

function calculateAvg(ratings) {
  const values = Object.values(ratings);
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}
