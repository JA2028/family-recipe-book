import { storage } from './storage.js';
import { getRecipe } from './recipeUtils.js';

const CATEGORIES = {
  'Produce': ['lettuce', 'tomato', 'onion', 'garlic', 'potato', 'carrot', 'celery', 'pepper', 'cucumber', 'spinach', 'broccoli', 'apple', 'banana', 'orange', 'lemon', 'lime', 'berry', 'fruit', 'vegetable'],
  'Dairy & Eggs': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'egg', 'sour cream', 'cottage cheese'],
  'Meat & Seafood': ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'sausage', 'ham'],
  'Pantry': ['flour', 'sugar', 'salt', 'pepper', 'oil', 'vinegar', 'rice', 'pasta', 'beans', 'sauce', 'spice', 'herb', 'stock', 'broth', 'can', 'baking'],
  'Frozen': ['frozen', 'ice cream'],
  'Bakery': ['bread', 'bun', 'roll', 'tortilla', 'pita'],
  'Other': []
};

/**
 * Parse ingredient string to extract quantity, unit, and item
 * @param {string} ingredient
 * @returns {Object}
 */
export function parseIngredient(ingredient) {
  const parts = ingredient.trim().split(/\s+/);
  
  // Try to extract quantity (first numeric part)
  let quantity = '';
  let unit = '';
  let item = ingredient;
  
  const quantityMatch = ingredient.match(/^([\d\/\.\s]+)/);
  if (quantityMatch) {
    quantity = quantityMatch[1].trim();
    const rest = ingredient.substring(quantityMatch[0].length).trim();
    
    // Try to extract unit (next word if it looks like a unit)
    const unitMatch = rest.match(/^(cup|cups|tbsp|tsp|tablespoon|teaspoon|oz|ounce|lb|pound|g|gram|kg|ml|l|liter)\s+/i);
    if (unitMatch) {
      unit = unitMatch[1];
      item = rest.substring(unitMatch[0].length).trim();
    } else {
      item = rest;
    }
  }
  
  return { quantity, unit, item, original: ingredient };
}

/**
 * Categorize an ingredient based on keywords
 * @param {string} ingredientText
 * @returns {string}
 */
export function categorizeIngredient(ingredientText) {
  const lower = ingredientText.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (category === 'Other') continue;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Other';
}

/**
 * Generate shopping list from recipe IDs
 * @param {string[]} recipeIds
 * @returns {Promise<Object>} - Categorized shopping list
 */
export async function generateShoppingList(recipeIds) {
  const ingredientMap = new Map(); // item -> { quantity, unit, category }
  
  for (const recipeId of recipeIds) {
    const recipe = await getRecipe(recipeId);
    if (!recipe) continue;
    
    for (const ing of recipe.ingredients) {
      const parsed = parseIngredient(ing);
      const category = categorizeIngredient(parsed.item);
      
      if (ingredientMap.has(parsed.item)) {
        // Combine quantities if possible
        const existing = ingredientMap.get(parsed.item);
        if (parsed.quantity && existing.unit === parsed.unit) {
          const existingQty = parseFloat(existing.quantity) || 0;
          const newQty = parseFloat(parsed.quantity) || 0;
          existing.quantity = (existingQty + newQty).toString();
        } else {
          // Can't combine, append to original
          existing.original += `, ${parsed.original}`;
        }
      } else {
        ingredientMap.set(parsed.item, {
          ...parsed,
          category,
          checked: false
        });
      }
    }
  }
  
  // Organize by category
  const categorized = {};
  for (const category of Object.keys(CATEGORIES)) {
    categorized[category] = [];
  }
  
  for (const [item, data] of ingredientMap.entries()) {
    categorized[data.category].push({
      id: `${item}_${Date.now()}`,
      item,
      ...data
    });
  }
  
  return categorized;
}

/**
 * Get shopping list for a specific week
 * @param {string} weekKey - YYYY-MM-DD format
 * @returns {Promise<Object>}
 */
export async function getShoppingList(weekKey) {
  return await storage.get(`shopping_list:${weekKey}`, null);
}

/**
 * Save shopping list
 * @param {string} weekKey
 * @param {Object} shoppingList
 * @returns {Promise<void>}
 */
export async function saveShoppingList(weekKey, shoppingList) {
  await storage.set(`shopping_list:${weekKey}`, shoppingList);
}

/**
 * Toggle item checked status
 * @param {Object} shoppingList
 * @param {string} itemId
 * @returns {Object} - Updated shopping list
 */
export function toggleItemChecked(shoppingList, itemId) {
  const updated = { ...shoppingList };
  
  for (const category of Object.keys(updated)) {
    const items = updated[category];
    const item = items.find(i => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      break;
    }
  }
  
  return updated;
}

/**
 * Add custom item to shopping list
 * @param {Object} shoppingList
 * @param {string} itemText
 * @param {string} category
 * @returns {Object} - Updated shopping list
 */
export function addCustomItem(shoppingList, itemText, category = 'Other') {
  const updated = { ...shoppingList };
  const parsed = parseIngredient(itemText);
  
  if (!updated[category]) {
    updated[category] = [];
  }
  
  updated[category].push({
    id: `custom_${Date.now()}_${Math.random()}`,
    item: parsed.item,
    ...parsed,
    category,
    checked: false
  });
  
  return updated;
}

/**
 * Remove item from shopping list
 * @param {Object} shoppingList
 * @param {string} itemId
 * @returns {Object} - Updated shopping list
 */
export function removeItem(shoppingList, itemId) {
  const updated = { ...shoppingList };
  
  for (const category of Object.keys(updated)) {
    updated[category] = updated[category].filter(item => item.id !== itemId);
  }
  
  return updated;
}

/**
 * Clear all checked items
 * @param {Object} shoppingList
 * @returns {Object} - Updated shopping list
 */
export function clearCheckedItems(shoppingList) {
  const updated = { ...shoppingList };
  
  for (const category of Object.keys(updated)) {
    updated[category] = updated[category].filter(item => !item.checked);
  }
  
  return updated;
}
