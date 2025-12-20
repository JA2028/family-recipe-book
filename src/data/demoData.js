import { storage } from '../utils/storage.js';
import { createUser, setCurrentUser, getAllUsers } from '../utils/userUtils.js';
import { createRecipe } from '../utils/recipeUtils.js';

/**
 * Initialize demo data if no data exists
 * @returns {Promise<void>}
 */
export async function initializeDemoData() {
  // Check if we already have users
  const existingUsers = await getAllUsers();
  if (existingUsers.length > 0) {
    console.log('Users already exist, skipping demo data initialization');
    return; // Already have data
  }
  
  console.log('Initializing demo data...');
  
  // Create demo users
  const mom = await createUser('Mom');
  const dad = await createUser('Dad');
  
  // Set Mom as current user
  await setCurrentUser(mom);
  
  // Check if already have recipes
  const existingIndex = await storage.get('recipe_index', []);
  if (existingIndex.length > 0) {
    console.log('Recipes already exist, skipping recipe initialization');
    return;
  }
  
  // Create demo recipes
  const recipes = [
    {
      name: "Grandma's Chocolate Chip Cookies",
      photoUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
      prepTime: 15,
      cookTime: 12,
      servings: 24,
      categories: ["Dessert", "Family Favorite"],
      ingredients: [
        "2 cups all-purpose flour",
        "1 tsp baking soda",
        "1 cup butter, softened",
        "3/4 cup granulated sugar",
        "3/4 cup brown sugar",
        "2 large eggs",
        "2 tsp vanilla extract",
        "2 cups chocolate chips"
      ],
      instructions: [
        "Preheat oven to 375°F (190°C)",
        "Mix flour and baking soda in a bowl",
        "In a large bowl, cream butter and both sugars until fluffy",
        "Beat in eggs one at a time, then add vanilla",
        "Gradually blend in flour mixture",
        "Stir in chocolate chips",
        "Drop rounded tablespoons onto ungreased cookie sheets",
        "Bake 9-11 minutes or until golden brown",
        "Cool on baking sheet for 2 minutes before transferring to wire rack"
      ],
      authorId: mom.id,
      authorName: mom.name
    },
    {
      name: "Classic Spaghetti Bolognese",
      photoUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80",
      prepTime: 15,
      cookTime: 45,
      servings: 6,
      categories: ["Dinner", "Italian"],
      ingredients: [
        "1 lb ground beef",
        "1 onion, diced",
        "3 cloves garlic, minced",
        "1 can (28 oz) crushed tomatoes",
        "2 tbsp tomato paste",
        "1 cup beef broth",
        "2 tsp dried oregano",
        "1 tsp dried basil",
        "Salt and pepper to taste",
        "1 lb spaghetti",
        "Parmesan cheese for serving"
      ],
      instructions: [
        "Heat a large pot over medium-high heat",
        "Add ground beef and cook until browned, breaking it up as it cooks",
        "Add onion and garlic, cook until softened",
        "Stir in tomato paste and cook for 1 minute",
        "Add crushed tomatoes, beef broth, oregano, and basil",
        "Season with salt and pepper",
        "Bring to a simmer, then reduce heat and cook for 30-40 minutes, stirring occasionally",
        "Meanwhile, cook spaghetti according to package directions",
        "Serve sauce over spaghetti with Parmesan cheese"
      ],
      authorId: dad.id,
      authorName: dad.name
    },
    {
      name: "Quick Chicken Stir Fry",
      photoUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80",
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      categories: ["Dinner", "Quick Meal", "Asian"],
      ingredients: [
        "1 lb chicken breast, cut into strips",
        "2 cups mixed vegetables (broccoli, carrots, bell peppers)",
        "3 tbsp soy sauce",
        "1 tbsp sesame oil",
        "2 cloves garlic, minced",
        "1 tsp ginger, minced",
        "2 tbsp vegetable oil",
        "Cooked rice for serving"
      ],
      instructions: [
        "Heat vegetable oil in a large wok or skillet over high heat",
        "Add chicken and cook until no longer pink, about 5 minutes",
        "Remove chicken and set aside",
        "Add vegetables to the pan and stir-fry for 3-4 minutes",
        "Add garlic and ginger, cook for 30 seconds",
        "Return chicken to pan",
        "Add soy sauce and sesame oil, toss to combine",
        "Cook for another 2 minutes until heated through",
        "Serve immediately over rice"
      ],
      authorId: mom.id,
      authorName: mom.name
    },
    {
      name: "Fluffy Pancakes",
      photoUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=80",
      prepTime: 5,
      cookTime: 15,
      servings: 4,
      categories: ["Breakfast", "Quick Meal"],
      ingredients: [
        "2 cups all-purpose flour",
        "2 tbsp sugar",
        "2 tsp baking powder",
        "1 tsp baking soda",
        "1/2 tsp salt",
        "2 cups buttermilk",
        "2 large eggs",
        "1/4 cup melted butter",
        "Maple syrup for serving"
      ],
      instructions: [
        "In a large bowl, whisk together flour, sugar, baking powder, baking soda, and salt",
        "In another bowl, whisk together buttermilk, eggs, and melted butter",
        "Pour wet ingredients into dry ingredients and stir until just combined (batter should be lumpy)",
        "Heat a griddle or large skillet over medium heat and lightly grease",
        "Pour 1/4 cup batter for each pancake onto the griddle",
        "Cook until bubbles form on surface and edges look set, about 2-3 minutes",
        "Flip and cook another 1-2 minutes until golden brown",
        "Serve warm with maple syrup"
      ],
      authorId: dad.id,
      authorName: dad.name
    },
    {
      name: "Fresh Garden Salad",
      photoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
      prepTime: 10,
      cookTime: 0,
      servings: 4,
      categories: ["Lunch", "Vegetarian", "Quick Meal"],
      ingredients: [
        "6 cups mixed salad greens",
        "1 cup cherry tomatoes, halved",
        "1 cucumber, sliced",
        "1/2 red onion, thinly sliced",
        "1 carrot, shredded",
        "1/4 cup olive oil",
        "2 tbsp balsamic vinegar",
        "1 tsp Dijon mustard",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Wash and dry all vegetables",
        "In a large bowl, combine salad greens, tomatoes, cucumber, onion, and carrot",
        "In a small bowl, whisk together olive oil, balsamic vinegar, and Dijon mustard",
        "Season dressing with salt and pepper",
        "Drizzle dressing over salad just before serving",
        "Toss gently to combine"
      ],
      authorId: mom.id,
      authorName: mom.name
    }
  ];
  
  for (const recipeData of recipes) {
    await createRecipe(recipeData);
  }
  
  console.log('Demo data initialized successfully');
}