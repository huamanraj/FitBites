import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeFood } from '../config/gemini';
import { databases } from '../config/appwrite';
import { DATABASE_ID, COLLECTION_ID } from '../config/appwrite';
import { useAuth } from '../context/AuthContext';

export default function FoodInput({ onNewEntry }) {
  const { user } = useAuth();
  const [foodDescription, setFoodDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foodDescription.trim()) return;
    
    setLoading(true);
    setError('');

    try {
      const nutritionData = await analyzeFood(foodDescription);
      
      // Ensure all values are integers before saving
      const documentData = {
        description: foodDescription,
        calories: Math.round(nutritionData.calories),
        protein: Math.round(nutritionData.protein),
        carbs: Math.round(nutritionData.carbs),
        fat: Math.round(nutritionData.fat),
        timestamp: new Date().toISOString(),
        userId: user.$id,
      };

      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        'unique()',
        documentData
      );

      setFoodDescription('');
      await onNewEntry?.();
    } catch (error) {
      setError(error.message || 'Failed to analyze and save food entry. Please try again.');
      console.error('Error saving food entry:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="foodDescription" className="block text-sm font-medium text-slate-300 mb-2">
            What did you eat?
          </label>
          <textarea
            id="foodDescription"
            rows={3}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
            placeholder="Describe your meal (e.g., '2 scrambled eggs with 2 slices of whole wheat toast')"
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            disabled={loading}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-400 text-sm bg-red-900/20 py-2 px-4 rounded-lg"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ backgroundColor: '#059669' }}
          type="submit"
          disabled={loading || !foodDescription.trim()}
          className={`w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium transition-colors duration-200
            ${loading || !foodDescription.trim() 
              ? 'bg-slate-700 text-slate-300 cursor-not-allowed' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
            }`}
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </div>
          ) : (
            'Add Food Entry'
          )}
        </motion.button>
      </form>
    </div>
  );
} 