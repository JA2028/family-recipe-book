import { storage } from './storage.js';

/**
 * Get the start of week (Monday) for a given date
 * @param {Date} date
 * @returns {Date}
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Format date as YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
export function formatDateKey(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

/**
 * Get meal plan for a specific week
 * @param {Date} weekStart - Start of the week (Monday)
 * @returns {Promise<Object>}
 */
export async function getMealPlan(weekStart) {
  const weekKey = formatDateKey(weekStart);
  const mealPlan = await storage.get(`meal_plan:${weekKey}`, null);
  
  if (!mealPlan) {
    // Initialize empty meal plan
    const days = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateKey = formatDateKey(date);
      days[dateKey] = {
        breakfast: null,
        lunch: null,
        dinner: null
      };
    }
    
    return {
      weekOf: weekKey,
      days
    };
  }
  
  return mealPlan;
}

/**
 * Save meal plan for a week
 * @param {string} weekKey - Week start date in YYYY-MM-DD format
 * @param {Object} mealPlan
 * @returns {Promise<void>}
 */
export async function saveMealPlan(weekKey, mealPlan) {
  await storage.set(`meal_plan:${weekKey}`, mealPlan);
}

/**
 * Assign a recipe to a meal slot
 * @param {Date} date
 * @param {string} mealType - 'breakfast', 'lunch', or 'dinner'
 * @param {string} recipeId
 * @returns {Promise<void>}
 */
export async function assignMealToSlot(date, mealType, recipeId) {
  const weekStart = getWeekStart(date);
  const weekKey = formatDateKey(weekStart);
  const dateKey = formatDateKey(date);
  
  const mealPlan = await getMealPlan(weekStart);
  
  if (!mealPlan.days[dateKey]) {
    mealPlan.days[dateKey] = {
      breakfast: null,
      lunch: null,
      dinner: null
    };
  }
  
  mealPlan.days[dateKey][mealType] = recipeId;
  await saveMealPlan(weekKey, mealPlan);
}

/**
 * Remove a recipe from a meal slot
 * @param {Date} date
 * @param {string} mealType
 * @returns {Promise<void>}
 */
export async function removeMealFromSlot(date, mealType) {
  await assignMealToSlot(date, mealType, null);
}

/**
 * Get all recipe IDs from current week's meal plan
 * @param {Date} weekStart
 * @returns {Promise<string[]>}
 */
export async function getWeekRecipeIds(weekStart) {
  const mealPlan = await getMealPlan(weekStart);
  const recipeIds = new Set();
  
  Object.values(mealPlan.days).forEach(day => {
    if (day.breakfast) recipeIds.add(day.breakfast);
    if (day.lunch) recipeIds.add(day.lunch);
    if (day.dinner) recipeIds.add(day.dinner);
  });
  
  return Array.from(recipeIds);
}
