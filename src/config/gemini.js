export const analyzeFood = async (foodDescription) => {
  try {
    const response = await fetch('http://localhost:3000/api/analyze-food', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ foodDescription }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze food');
    }

    const nutritionData = await response.json();
    return nutritionData;
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw new Error(`Failed to analyze food: ${error.message}`);
  }
};
