export const generateDietPlan = async (userData) => {
  try {
    const response = await fetch('https://fitbitesapi.vercel.app/api/generate-diet-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate diet plan');
    }

    const data = await response.json();
    return data.dietPlan;
  } catch (error) {
    console.error("Error generating plan:", error);
    throw new Error("Failed to generate plan");
  }
};
