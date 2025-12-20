import React, { useState, useEffect } from 'react';
import { 
  ChefHat, Search, Plus, Star, Clock, Users, Calendar, 
  ShoppingCart, X, Edit2, Trash2, Check, ChevronLeft,
  ChevronRight, Filter, MessageSquare, Image as ImageIcon,
  Printer, Download, Menu
} from 'lucide-react';
import { UserProvider, useUser } from './hooks/UserContext.jsx';
import { initializeDemoData } from './data/demoData.js';
import { 
  getAllRecipes, createRecipe, updateRecipe, deleteRecipe,
  getRatings, setRating, getComments, addComment, getPhotos, addPhoto,
  filterRecipes, sortRecipes
} from './utils/recipeUtils.js';
import { calculateAverageRating, formatDate } from './utils/storage.js';
import {
  getMealPlan, assignMealToSlot, removeMealFromSlot,
  getWeekStart, formatDateKey, getWeekRecipeIds
} from './utils/mealPlanUtils.js';
import {
  generateShoppingList as generateShoppingListUtil,
  getShoppingList, saveShoppingList,
  toggleItemChecked, addCustomItem, removeItem, clearCheckedItems
} from './utils/shoppingListUtils.js';

// Category options
const CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack',
  'Vegetarian', 'Vegan', 'Quick Meal', 'Holiday', 'Italian', 'Asian'
];

// UserSwitcher Component
function UserSwitcher() {
  const { currentUser, allUsers, switchUser, addNewUser } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewUserForm, setShowNewUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');

  async function handleAddUser() {
    if (!newUserName.trim()) return;
    await addNewUser(newUserName);
    setNewUserName('');
    setShowNewUserForm(false);
    setShowDropdown(false);
  }

  if (!currentUser) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: currentUser.color }}
        >
          {currentUser.name[0]}
        </div>
        <span className="font-medium">{currentUser.name}</span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border w-48 z-50">
          <div className="p-2">
            {allUsers.map(user => (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user);
                  setShowDropdown(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
                  user.id === currentUser.id ? 'bg-gray-50' : ''
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name[0]}
                </div>
                <span>{user.name}</span>
              </button>
            ))}
            
            {showNewUserForm ? (
              <div className="mt-2 pt-2 border-t">
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Name"
                  className="w-full px-2 py-1 border rounded mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 px-2 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowNewUserForm(false)}
                    className="px-2 py-1 border rounded text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewUserForm(true)}
                className="w-full mt-2 pt-2 border-t px-3 py-2 text-left hover:bg-gray-100 rounded flex items-center gap-2 text-primary-600"
              >
                <Plus size={16} />
                <span>Add User</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// StarRating Component
function StarRating({ rating, onRate, readonly = false }) {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onRate?.(star)}
          className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star
            size={20}
            className={`${
              star <= (hover || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// RecipeCard Component
function RecipeCard({ recipe, avgRating, onSelect }) {
  return (
    <div
      onClick={() => onSelect(recipe)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="h-48 bg-gray-200 overflow-hidden">
        <img
          src={recipe.photoUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.name}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime + recipe.cookTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{recipe.servings}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <StarRating rating={Math.round(avgRating)} readonly />
          <span className="text-sm text-gray-500">{recipe.authorName}</span>
        </div>
      </div>
    </div>
  );
}

// RecipeForm Component  
function RecipeForm({ recipe, onSave, onCancel }) {
  const { currentUser } = useUser();
  const [formData, setFormData] = useState(recipe || {
    name: '',
    photoUrl: '',
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    categories: [],
    ingredients: [''],
    instructions: ['']
  });

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...formData,
      authorId: recipe?.authorId || currentUser.id,
      authorName: recipe?.authorName || currentUser.name
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Recipe Name *</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block font-medium mb-1">Photo URL</label>
        <input
          type="url"
          value={formData.photoUrl}
          onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block font-medium mb-1">Prep Time (min)</label>
          <input
            type="number"
            value={formData.prepTime}
            onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Cook Time (min)</label>
          <input
            type="number"
            value={formData.cookTime}
            onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Servings</label>
          <input
            type="number"
            value={formData.servings}
            onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                const cats = formData.categories.includes(cat)
                  ? formData.categories.filter(c => c !== cat)
                  : [...formData.categories, cat];
                setFormData({ ...formData, categories: cats });
              }}
              className={`px-3 py-1 rounded-full text-sm ${
                formData.categories.includes(cat)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-medium mb-1">Ingredients</label>
        {formData.ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={ing}
              onChange={(e) => {
                const newIngs = [...formData.ingredients];
                newIngs[i] = e.target.value;
                setFormData({ ...formData, ingredients: newIngs });
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="e.g., 2 cups flour"
            />
            <button
              type="button"
              onClick={() => {
                const newIngs = formData.ingredients.filter((_, idx) => idx !== i);
                setFormData({ ...formData, ingredients: newIngs.length ? newIngs : [''] });
              }}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, ingredients: [...formData.ingredients, ''] })}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          + Add Ingredient
        </button>
      </div>

      <div>
        <label className="block font-medium mb-1">Instructions</label>
        {formData.instructions.map((inst, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <span className="px-3 py-2 bg-gray-100 rounded-lg font-medium">{i + 1}</span>
            <input
              type="text"
              value={inst}
              onChange={(e) => {
                const newInsts = [...formData.instructions];
                newInsts[i] = e.target.value;
                setFormData({ ...formData, instructions: newInsts });
              }}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="Describe this step"
            />
            <button
              type="button"
              onClick={() => {
                const newInsts = formData.instructions.filter((_, idx) => idx !== i);
                setFormData({ ...formData, instructions: newInsts.length ? newInsts : [''] });
              }}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setFormData({ ...formData, instructions: [...formData.instructions, ''] })}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          + Add Step
        </button>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 font-medium"
        >
          {recipe ? 'Update Recipe' : 'Create Recipe'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// RecipeDetail Component
function RecipeDetail({ recipe, onClose, onEdit, onDelete, onRefresh }) {
  const { currentUser } = useUser();
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  useEffect(() => {
    loadRecipeData();
  }, [recipe.id]);

  async function loadRecipeData() {
    const [r, c, p] = await Promise.all([
      getRatings(recipe.id),
      getComments(recipe.id),
      getPhotos(recipe.id)
    ]);
    setRatings(r);
    setComments(c);
    setPhotos(p);
  }

  async function handleRate(rating) {
    await setRating(recipe.id, currentUser.id, rating);
    await loadRecipeData();
    onRefresh();
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    await addComment(recipe.id, currentUser.id, currentUser.name, newComment);
    setNewComment('');
    await loadRecipeData();
  }

  async function handleAddPhoto() {
    if (!newPhotoUrl.trim()) return;
    await addPhoto(recipe.id, currentUser.id, currentUser.name, newPhotoUrl);
    setNewPhotoUrl('');
    await loadRecipeData();
  }

  const avgRating = calculateAverageRating(ratings);
  const userRating = ratings[currentUser?.id] || 0;
  const canEdit = currentUser?.id === recipe.authorId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8 print-recipe">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between no-print">
          <h2 className="text-2xl font-bold">{recipe.name}</h2>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="p-2 hover:bg-gray-100 rounded">
              <Printer size={20} />
            </button>
            {canEdit && (
              <>
                <button onClick={() => onEdit(recipe)} className="p-2 hover:bg-gray-100 rounded">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => onDelete(recipe.id)} className="p-2 hover:bg-red-50 text-red-600 rounded">
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <img
            src={recipe.photoUrl || 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={recipe.name}
            className="w-full h-64 object-cover rounded-lg mb-6"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{recipe.prepTime}</div>
              <div className="text-sm text-gray-600">Prep Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{recipe.cookTime}</div>
              <div className="text-sm text-gray-600">Cook Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{recipe.servings}</div>
              <div className="text-sm text-gray-600">Servings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-600">{avgRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Rating</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {recipe.categories.map(cat => (
                <span key={cat} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6 no-print">
            <label className="block font-semibold mb-2">Your Rating</label>
            <StarRating rating={userRating} onRate={handleRate} />
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 no-print" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((inst, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <p className="pt-1">{inst}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="mb-6 no-print">
            <h3 className="text-xl font-semibold mb-3">Comments</h3>
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{comment.userName}</span>
                    <span className="text-sm text-gray-500">{formatDate(comment.date)}</span>
                  </div>
                  <p>{comment.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Post
              </button>
            </div>
          </div>

          <div className="no-print">
            <h3 className="text-xl font-semibold mb-3">Photo Gallery</h3>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-4">
                {photos.map(photo => (
                  <div key={photo.id} className="relative">
                    <img src={photo.url} alt="Recipe" className="w-full h-32 object-cover rounded-lg" />
                    <div className="text-xs text-gray-600 mt-1">{photo.userName}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Photo URL..."
                className="flex-1 px-3 py-2 border rounded-lg"
              />
              <button
                onClick={handleAddPhoto}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Add Photo
              </button>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>By {recipe.authorName} • {formatDate(recipe.dateAdded)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// MealPlanner Component
function MealPlanner({ recipes, onClose }) {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart(new Date()));
  const [mealPlan, setMealPlan] = useState(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(null);
  const [weekRecipes, setWeekRecipes] = useState({});

  useEffect(() => {
    loadMealPlan();
  }, [currentWeek]);

  async function loadMealPlan() {
    const plan = await getMealPlan(currentWeek);
    setMealPlan(plan);

    const recipeMap = {};
    for (const day of Object.values(plan.days)) {
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        const recipeId = day[mealType];
        if (recipeId && !recipeMap[recipeId]) {
          const recipe = recipes.find(r => r.id === recipeId);
          if (recipe) recipeMap[recipeId] = recipe;
        }
      }
    }
    setWeekRecipes(recipeMap);
  }

  async function handleAssignRecipe(recipeId) {
    if (!showRecipeSelector) return;
    const date = new Date(showRecipeSelector.date);
    await assignMealToSlot(date, showRecipeSelector.mealType, recipeId);
    setShowRecipeSelector(null);
    await loadMealPlan();
  }

  async function handleRemoveMeal(dateKey, mealType) {
    const date = new Date(dateKey);
    await removeMealFromSlot(date, mealType);
    await loadMealPlan();
  }

  function getDayName(date) {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function navigateWeek(direction) {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    setCurrentWeek(newWeek);
  }

  if (!mealPlan) return <div>Loading...</div>;

  const days = Object.keys(mealPlan.days).sort();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} />
            Meal Planner
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => navigateWeek(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft size={24} />
            </button>
            <h3 className="text-lg font-semibold">Week of {getDayName(currentWeek)}</h3>
            <button onClick={() => navigateWeek(1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map(dateKey => (
              <div key={dateKey} className="border rounded-lg p-3">
                <div className="font-semibold mb-3 text-center">{getDayName(dateKey)}</div>
                {['breakfast', 'lunch', 'dinner'].map(mealType => {
                  const recipeId = mealPlan.days[dateKey][mealType];
                  const recipe = recipeId ? weekRecipes[recipeId] : null;

                  return (
                    <div key={mealType} className="mb-3">
                      <div className="text-xs text-gray-500 mb-1 capitalize">{mealType}</div>
                      {recipe ? (
                        <div className="bg-primary-50 p-2 rounded relative group">
                          <div className="text-sm font-medium line-clamp-2">{recipe.name}</div>
                          <button
                            onClick={() => handleRemoveMeal(dateKey, mealType)}
                            className="absolute top-1 right-1 p-1 bg-white rounded shadow opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowRecipeSelector({ date: dateKey, mealType })}
                          className="w-full border-2 border-dashed rounded p-2 text-sm text-gray-500 hover:border-primary-500 hover:text-primary-600"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showRecipeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold">Select Recipe</h3>
              <button onClick={() => setShowRecipeSelector(null)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => handleAssignRecipe(recipe.id)}
                  className="text-left border rounded-lg p-3 hover:border-primary-500 hover:shadow"
                >
                  <div className="font-medium mb-1">{recipe.name}</div>
                  <div className="text-sm text-gray-600">
                    {recipe.prepTime + recipe.cookTime} min • {recipe.servings} servings
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ShoppingList Component
function ShoppingList({ onClose }) {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));
  const [shoppingList, setShoppingList] = useState(null);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadShoppingList();
  }, [weekStart]);

  async function loadShoppingList() {
    const weekKey = formatDateKey(weekStart);
    let list = await getShoppingList(weekKey);

    if (!list) {
      const recipeIds = await getWeekRecipeIds(weekStart);
      if (recipeIds.length > 0) {
        list = await generateShoppingListUtil(recipeIds);
        await saveShoppingList(weekKey, list);
      } else {
        list = {
          'Produce': [], 'Dairy & Eggs': [], 'Meat & Seafood': [],
          'Pantry': [], 'Frozen': [], 'Bakery': [], 'Other': []
        };
      }
    }

    setShoppingList(list);
  }

  async function handleToggleItem(itemId) {
    const updated = toggleItemChecked(shoppingList, itemId);
    setShoppingList(updated);
    await saveShoppingList(formatDateKey(weekStart), updated);
  }

  async function handleAddItem() {
    if (!newItem.trim()) return;
    const updated = addCustomItem(shoppingList, newItem, 'Other');
    setShoppingList(updated);
    await saveShoppingList(formatDateKey(weekStart), updated);
    setNewItem('');
  }

  async function handleRemoveItem(itemId) {
    const updated = removeItem(shoppingList, itemId);
    setShoppingList(updated);
    await saveShoppingList(formatDateKey(weekStart), updated);
  }

  async function handleClearChecked() {
    const updated = clearCheckedItems(shoppingList);
    setShoppingList(updated);
    await saveShoppingList(formatDateKey(weekStart), updated);
  }

  async function handleRegenerate() {
    const recipeIds = await getWeekRecipeIds(weekStart);
    const newList = await generateShoppingListUtil(recipeIds);
    setShoppingList(newList);
    await saveShoppingList(formatDateKey(weekStart), newList);
  }

  if (!shoppingList) return <div>Loading...</div>;

  const totalItems = Object.values(shoppingList).reduce((sum, items) => sum + items.length, 0);
  const checkedItems = Object.values(shoppingList).reduce(
    (sum, items) => sum + items.filter(i => i.checked).length, 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart size={24} />
              Shopping List
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{checkedItems} of {totalItems} items checked</div>
            <div className="flex gap-2">
              <button onClick={handleRegenerate} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Regenerate</button>
              <button onClick={handleClearChecked} className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Clear Checked</button>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Add custom item..."
              className="flex-1 px-3 py-2 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button onClick={handleAddItem} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
              Add
            </button>
          </div>

          {Object.entries(shoppingList).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <h3 className="font-semibold text-lg mb-3 text-primary-600">{category}</h3>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-center gap-3 p-2 rounded hover:bg-gray-50 ${item.checked ? 'opacity-50' : ''}`}>
                      <input type="checkbox" checked={item.checked} onChange={() => handleToggleItem(item.id)} className="w-5 h-5" />
                      <span className={`flex-1 ${item.checked ? 'line-through' : ''}`}>
                        {item.quantity && <span className="font-medium">{item.quantity} {item.unit} </span>}
                        {item.item}
                      </span>
                      <button onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Main AppContent Component
function AppContent() {
  const { currentUser, loading } = useUser();
  const [view, setView] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [ratingsMap, setRatingsMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('recent');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      initialize();
    }
  }, [loading, currentUser]);

  async function initialize() {
    await initializeDemoData();
    await loadRecipes();
  }

  async function loadRecipes() {
    const allRecipes = await getAllRecipes();
    setRecipes(allRecipes);

    const ratings = {};
    for (const recipe of allRecipes) {
      ratings[recipe.id] = await getRatings(recipe.id);
    }
    setRatingsMap(ratings);
  }

  async function handleSaveRecipe(recipeData) {
    if (editingRecipe) {
      await updateRecipe(editingRecipe.id, recipeData);
    } else {
      await createRecipe(recipeData);
    }
    setShowRecipeForm(false);
    setEditingRecipe(null);
    await loadRecipes();
  }

  async function handleDeleteRecipe(recipeId) {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    await deleteRecipe(recipeId);
    setSelectedRecipe(null);
    await loadRecipes();
  }

  function handleEditRecipe(recipe) {
    setEditingRecipe(recipe);
    setSelectedRecipe(null);
    setShowRecipeForm(true);
  }

  const filteredRecipes = filterRecipes(recipes, { ...filters, search: searchQuery });
  const sortedRecipes = sortRecipes(filteredRecipes, sortBy, ratingsMap);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Family Recipe Book</h1>
          <p>Please create a user profile to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat className="text-primary-500" size={32} />
              <h1 className="text-2xl font-bold text-gray-900">Family Recipe Book</h1>
            </div>
            <UserSwitcher />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter size={20} />
              Filters
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-[120px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('recipes')} className={`px-4 py-3 border-b-2 transition-colors ${view === 'recipes' ? 'border-primary-500 text-primary-600 font-medium' : 'border-transparent hover:border-gray-300'}`}>
              All Recipes
            </button>
            <button onClick={() => setView('mealPlan')} className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${view === 'mealPlan' ? 'border-primary-500 text-primary-600 font-medium' : 'border-transparent hover:border-gray-300'}`}>
              <Calendar size={18} />
              Meal Plan
            </button>
            <button onClick={() => setView('shoppingList')} className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${view === 'shoppingList' ? 'border-primary-500 text-primary-600 font-medium' : 'border-transparent hover:border-gray-300'}`}>
              <ShoppingCart size={18} />
              Shopping List
            </button>
            <div className="flex-1" />
            <button onClick={() => { setEditingRecipe(null); setShowRecipeForm(true); }} className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2 my-2">
              <Plus size={20} />
              Add Recipe
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {view === 'recipes' && (
          <>
            {showFilters && (
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-medium mb-2">Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                      <option value="recent">Recently Added</option>
                      <option value="rating">Highest Rated</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="random">Random</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Categories</label>
                    <select onChange={(e) => { const cat = e.target.value; if (cat) { setFilters({ ...filters, categories: [...(filters.categories || []), cat] }); } }} className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Select category...</option>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {filters.categories?.map(cat => (
                        <span key={cat} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1">
                          {cat}
                          <button onClick={() => setFilters({ ...filters, categories: filters.categories.filter(c => c !== cat) })} className="hover:text-primary-900">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">Prep Time</label>
                    <select value={filters.prepTime || ''} onChange={(e) => setFilters({ ...filters, prepTime: e.target.value || undefined })} className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Any</option>
                      <option value="quick">&lt; 15 min</option>
                      <option value="medium">15-30 min</option>
                      <option value="long">30-60 min</option>
                      <option value="verylong">60+ min</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} avgRating={calculateAverageRating(ratingsMap[recipe.id] || {})} onSelect={setSelectedRecipe} />
              ))}
            </div>

            {sortedRecipes.length === 0 && (
              <div className="text-center py-12 text-gray-500">No recipes found. Try adjusting your filters or add a new recipe!</div>
            )}
          </>
        )}

        {view === 'mealPlan' && <MealPlanner recipes={recipes} onClose={() => setView('recipes')} />}
        {view === 'shoppingList' && <ShoppingList onClose={() => setView('recipes')} />}
      </main>

      {showRecipeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <h2 className="text-2xl font-bold">{editingRecipe ? 'Edit Recipe' : 'New Recipe'}</h2>
            </div>
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <RecipeForm recipe={editingRecipe} onSave={handleSaveRecipe} onCancel={() => { setShowRecipeForm(false); setEditingRecipe(null); }} />
            </div>
          </div>
        </div>
      )}

      {selectedRecipe && (
        <RecipeDetail recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} onEdit={handleEditRecipe} onDelete={handleDeleteRecipe} onRefresh={loadRecipes} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}
