const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['https://fitbites.vercel.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Helper function to extract JSON from text
const extractJSON = (text) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return null;
    } catch (error) {
        console.error("Error parsing JSON:", error);
        return null;
    }
};

// Helper function to round to integer
const roundToInteger = (num) => Math.round(num);

// Analyze food endpoint
app.post('/api/analyze-food', async (req, res) => {
    try {
        const { foodDescription } = req.body;

        if (!foodDescription) {
            return res.status(400).json({ error: 'Food description is required' });
        }

        const prompt = `Analyze the following food and provide ONLY a valid JSON object with nutritional information. 
    The response must be a single JSON object with exactly these numeric fields (all values must be whole numbers):
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
    
    Do not include any markdown formatting, explanations, or additional text.
    Just return the raw JSON object with integer values.
    
    Food to analyze: "${foodDescription}"
    
    Example of expected response format:
    {
      "calories": 350,
      "protein": 12,
      "carbs": 45,
      "fat": 14
    }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a nutrition analysis assistant that only responds with JSON." },
                { role: "user", content: prompt }
            ]
        });

        const text = completion.choices[0].message.content;
        const nutritionData = extractJSON(text);

        if (!nutritionData) {
            return res.status(500).json({ error: "Invalid response format from AI" });
        }

        // Round all numeric values to integers
        const roundedData = {
            calories: roundToInteger(nutritionData.calories),
            protein: roundToInteger(nutritionData.protein),
            carbs: roundToInteger(nutritionData.carbs),
            fat: roundToInteger(nutritionData.fat)
        };

        // Validate the response has all required fields and they are integers
        const requiredFields = ['calories', 'protein', 'carbs', 'fat'];
        for (const field of requiredFields) {
            if (!Number.isInteger(roundedData[field])) {
                return res.status(500).json({ error: `Invalid or missing ${field} value` });
            }
        }

        res.json(roundedData);
    } catch (error) {
        console.error("Error analyzing food:", error);
        res.status(500).json({ error: `Failed to analyze food: ${error.message}` });
    }
});


// Diet plan generation endpoint
app.post('/api/generate-diet-plan', async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData) {
      return res.status(400).json({ error: 'User data is required' });
    }

    const prompt = `Create a comprehensive diet and exercise plan based on the following user information:

Age: ${userData.age}
Gender: ${userData.gender}
Weight: ${userData.weight}kg
Height: ${userData.height}cm
Activity Level: ${userData.activityLevel}
Goal: ${userData.goal}
Dietary Restrictions: ${userData.dietaryRestrictions?.join(', ') || 'None'}
Allergies: ${userData.allergies?.join(', ') || 'None'}
Medical Conditions: ${userData.medicalConditions?.join(', ') || 'None'}
Preferred Cuisines: ${userData.preferredCuisines?.join(', ') || 'No specific preference'}
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

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional nutritionist and fitness expert who creates personalized diet and exercise plans." },
        { role: "user", content: prompt }
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const dietPlan = completion.choices[0].message.content;
    res.json({ dietPlan });
  } catch (error) {
    console.error("Error generating diet plan:", error);
    res.status(500).json({ error: `Failed to generate diet plan: ${error.message}` });
  }
});



// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
