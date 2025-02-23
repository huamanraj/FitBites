import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const extractJSON = (text) => {
  try {
    // Try to find JSON object in the response using regex
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

const roundToInteger = (num) => Math.round(num);

export const analyzeFood = async (foodDescription) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
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
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const nutritionData = extractJSON(text);
    if (!nutritionData) {
      throw new Error("Invalid response format");
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
        throw new Error(`Invalid or missing ${field} value`);
      }
    }

    return roundedData;
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw new Error(`Failed to analyze food: ${error.message}`);
  }
}; 