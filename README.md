# Family Recipe Book

A collaborative family recipe book web application where multiple family members can add, manage, and share recipes with meal planning and shopping list features.

## Features

### ✨ Core Features

- **User Profiles**: Multiple family members can create profiles and switch between them
- **Recipe Management**: Full CRUD operations for recipes with photos, ingredients, and instructions
- **Ratings & Reviews**: Star ratings and comments system for collaborative feedback
- **Photo Gallery**: Family members can share photos of their cooking attempts
- **Search & Filter**: Advanced search and filtering by name, ingredients, categories, prep time
- **Meal Planning**: Weekly calendar view for planning breakfast, lunch, and dinner
- **Shopping List**: Automatically generated shopping lists from meal plans with smart ingredient parsing and categorization
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Print Support**: Clean print styles for recipe cards

### 📋 Recipe Features

- Recipe name, photo, prep/cook time, servings
- Multiple category tags (Breakfast, Lunch, Dinner, Dessert, etc.)
- Detailed ingredients list with measurements
- Step-by-step instructions
- Author attribution
- Rating system (1-5 stars)
- Comments section
- Photo gallery from family attempts

### 📅 Meal Planning

- Weekly calendar view with day-by-day planning
- Assign recipes to breakfast, lunch, and dinner slots
- Navigate between different weeks
- Quick recipe selector modal

### 🛒 Shopping List

- Auto-generated from current week's meal plan
- Intelligent ingredient parsing and combination
- Organized by category (Produce, Dairy, Meat, Pantry, etc.)
- Check off items as you shop
- Add custom items manually
- Clear checked items
- Regenerate from meal plan

## Technology Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **window.storage API** - Persistent data storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd family-recipe-book
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Project Structure

```
family-recipe-book/
├── src/
│   ├── components/         # React components (integrated in App.jsx)
│   ├── hooks/             # Custom React hooks and contexts
│   │   └── UserContext.jsx
│   ├── utils/             # Utility functions and helpers
│   │   ├── storage.js           # Storage API wrapper
│   │   ├── recipeUtils.js       # Recipe CRUD operations
│   │   ├── userUtils.js         # User management
│   │   ├── mealPlanUtils.js     # Meal planning logic
│   │   └── shoppingListUtils.js # Shopping list generation
│   ├── data/              # Demo data initialization
│   │   └── demoData.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # App entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md             # This file
```

## Usage Guide

### Creating Your First User

When you first open the app, you'll be prompted to create a user profile. Click on the user icon in the top-right corner to add users. Each user gets a unique color avatar.

### Adding Recipes

1. Click the "+ Add Recipe" button
2. Fill in the recipe details:
   - Name (required)
   - Photo URL (optional)
   - Prep and cook times
   - Number of servings
   - Select categories
   - Add ingredients (one per line)
   - Add instructions (step by step)
3. Click "Create Recipe"

### Planning Meals

1. Click on "Meal Plan" in the navigation
2. Navigate to the desired week using arrow buttons
3. Click "+ Add" on any meal slot
4. Select a recipe from the popup
5. The recipe is now scheduled for that meal

### Generating Shopping Lists

1. Add recipes to your meal plan for the week
2. Click on "Shopping List" in the navigation
3. The list is automatically generated from your meal plan
4. Check off items as you shop
5. Add custom items if needed

### Rating and Commenting

1. Open any recipe by clicking on its card
2. Rate it using the star system
3. Add comments to share tips or modifications
4. Upload photos of your results

## Data Storage

All data is stored locally using the browser's persistent storage API (`window.storage`). This means:
- Data persists across browser sessions
- No server or database required
- Data is specific to each browser/device
- To share recipes, you would need to implement export/import functionality

## Demo Data

The app comes with 5 sample recipes and 2 sample users (Mom and Dad) to help you get started. This data is automatically loaded on first run if no recipes exist.

## Customization

### Adding More Categories

Edit the `CATEGORIES` array in `src/App.jsx`:

```javascript
const CATEGORIES = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack',
  'Vegetarian', 'Vegan', 'Quick Meal', 'Holiday', 'Italian', 'Asian',
  'YourNewCategory' // Add your own
];
```

### Changing Colors

The color scheme can be customized in `tailwind.config.js`. The primary color is set to orange (`#f97316`), but you can change it to any color you like.

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

Potential features for future development:
- Recipe import from URLs
- Export cookbook as PDF
- Recipe sharing via links
- Nutritional information tracking
- Recipe scaling (adjust servings)
- Cooking timers
- Recipe difficulty ratings
- Ingredient inventory management
- Cost estimation per recipe

## Contributing

This is a personal/family project, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this project for your own family recipe book!

## Support

For issues or questions, please open an issue on the repository.

---

**Built with ❤️ for families who love cooking together**
