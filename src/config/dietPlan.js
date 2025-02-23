import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateDietPlan = async (userData) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `Create a comprehensive diet and exercise plan based on the following user information:

Age: ${userData.age}
Gender: ${userData.gender}
Weight: ${userData.weight}kg
Height: ${userData.height}cm
Activity Level: ${userData.activityLevel}
Goal: ${userData.goal}
Dietary Restrictions: ${userData.dietaryRestrictions.join(', ') || 'None'}
Allergies: ${userData.allergies.join(', ') || 'None'}
Medical Conditions: ${userData.medicalConditions.join(', ') || 'None'}
Preferred Cuisines: ${userData.preferredCuisines.join(', ') || 'No specific preference'}
Meals per Day: ${userData.mealPreference}
Budget: ${userData.budget || 'Not specified'}
Cooking Time Preference: ${userData.cookingTime || 'Not specified'}

Please provide a detailed plan that includes:

# 📊 Nutritional Overview
- Daily caloric target
- Macronutrient breakdown (protein, carbs, fats)
- Key micronutrients to focus on

# 🍳 Weekly Meal Plan
For each day (Monday-Sunday), provide:
- Breakfast
- Lunch
- Dinner
- Snacks (if applicable)
Include calories and macros for each meal

# 🏋️ Exercise Program
Provide a weekly workout schedule with:
- Type of exercises
- Duration
- Intensity
- Rest periods
- Progressive overload suggestions
Tailor the exercises to the user's goals and activity level.

# 🛒 Shopping List
- Weekly grocery list organized by categories
- Estimated budget considerations

# 📝 Preparation Tips
- Meal prep strategies
- Time-saving cooking tips
- Food storage recommendations

# 💪 Progress Tracking
- Weekly goals
- Measurements to track
- Progress indicators

# ⚡ Supplement Recommendations
Based on goals and dietary restrictions

# 🎯 Additional Tips
- Hydration guidelines
- Sleep recommendations
- Lifestyle adjustments

Format the response in clear, structured markdown with emojis for better readability.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate plan");
  }
};