import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { databases, Query } from '../config/appwrite';
import { DATABASE_ID, DIET_PLAN_COLLECTION_ID } from '../config/appwrite';
import { generateDietPlan } from '../config/dietPlan';
import ReactMarkdown from 'react-markdown';
import { ID } from 'appwrite';
import { Link } from 'react-router-dom';
import 'github-markdown-css';

export default function DietPlan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    activityLevel: '',
    goal: '',
    dietaryRestrictions: [],
    allergies: [],
    medicalConditions: [],
    preferredCuisines: [],
    mealPreference: 3,
    budget: '',
    cookingTime: ''
  });
  const [dietPlan, setDietPlan] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchExistingPlan();
  }, [user]);

  const fetchExistingPlan = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID,
        DIET_PLAN_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (response.documents.length > 0) {
        const plan = response.documents[0];
        setFormData({
          age: plan.age,
          gender: plan.gender,
          weight: plan.weight,
          height: plan.height,
          activityLevel: plan.activityLevel,
          goal: plan.goal,
          dietaryRestrictions: plan.dietaryRestrictions || [],
          allergies: plan.allergies || [],
          medicalConditions: plan.medicalConditions || [],
          preferredCuisines: plan.preferredCuisines || [],
          mealPreference: plan.mealPreference,
          budget: plan.budget || '',
          cookingTime: plan.cookingTime || ''
        });
        setDietPlan(plan.dietPlan);
      }
    } catch (error) {
      console.error('Error fetching diet plan:', error);
      setError('Failed to load existing diet plan');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert numeric fields to integers
    if (['age', 'weight', 'height', 'mealPreference'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : parseInt(value, 10)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      const requiredFields = ['age', 'gender', 'weight', 'height', 'activityLevel', 'goal', 'mealPreference'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate numeric fields
      const numericFields = {
        age: { min: 13, max: 100 },
        weight: { min: 30, max: 300 },
        height: { min: 100, max: 250 },
        mealPreference: { min: 3, max: 6 }
      };

      for (const [field, limits] of Object.entries(numericFields)) {
        const value = parseInt(formData[field], 10);
        if (isNaN(value) || value < limits.min || value > limits.max) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} must be between ${limits.min} and ${limits.max}`);
        }
      }

      // Prepare document data with proper type conversion
      const documentData = {
        ...formData,
        age: parseInt(formData.age, 10),
        weight: parseInt(formData.weight, 10),
        height: parseInt(formData.height, 10),
        mealPreference: parseInt(formData.mealPreference, 10),
        userId: user.$id,
        lastUpdated: new Date().toISOString(),
        dietPlan: await generateDietPlan(formData)
      };

      // Save to Appwrite
      const response = await databases.listDocuments(
        DATABASE_ID,
        DIET_PLAN_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );

      if (response.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          DIET_PLAN_COLLECTION_ID,
          response.documents[0].$id,
          documentData
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          DIET_PLAN_COLLECTION_ID,
          ID.unique(),
          documentData
        );
      }

      setDietPlan(documentData.dietPlan);
      setSuccess('Diet plan generated and saved successfully!');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to generate diet plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const content = document.querySelector('.markdown-body');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Your Diet & Exercise Plan</title>
          <link href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css" rel="stylesheet">
          <style>
            body {
              padding: 2rem;
            }
            .markdown-body {
              box-sizing: border-box;
              min-width: 200px;
              max-width: 980px;
              margin: 0 auto;
              padding: 45px;
            }
            .markdown-body h1 { color: #059669; }
            .markdown-body h2 { color: #1f2937; }
            .markdown-body p, 
            .markdown-body ul, 
            .markdown-body li { color: #374151; }
            .markdown-body strong { color: #059669; }
            .markdown-body em { color: #4b5563; }
            @media print {
              @page {
                margin: 2cm;
              }
              body {
                padding: 0;
              }
              .markdown-body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body class="markdown-body">
          ${content.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    // Wait for styles to load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back to Dashboard */}
        <div className="flex justify-between items-center">
          <Link
            to="/dashboard"
            className="text-slate-300 hover:text-emerald-400 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {dietPlan ? (
          <>
            {/* Existing Plan Display */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-emerald-400">Your Diet & Exercise Plan</h2>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setDietPlan(null)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200"
                >
                  Create New Plan
                </motion.button>
              </div>

              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="markdown-body bg-transparent text-slate-300" style={{ '--color-canvas-default': 'transparent' }}>
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-emerald-400 mt-8 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-slate-200 mt-6 mb-3" {...props} />,
                        p: ({ node, ...props }) => <p className="text-slate-300 mb-4" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                        li: ({ node, ...props }) => <li className="text-slate-300 my-1" {...props} />,
                        strong: ({ node, ...props }) => <strong className="text-emerald-400 font-semibold" {...props} />,
                        em: ({ node, ...props }) => <em className="text-slate-400" {...props} />,
                      }}
                    >
                      {dietPlan}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Print Button */}
              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handlePrint}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-2 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Plan
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h1 className="text-3xl font-bold mb-8">Create Your Personalized Plan</h1>
              {formData.age ? (
                <p className="text-slate-300 mb-6">Your previous plan has been cleared. Fill the form below to create a new diet and exercise plan.</p>
              ) : (
                <p className="text-slate-300 mb-6">You don't have a diet and exercise plan yet. Fill the form below to get started!</p>
              )}
              
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Required Fields Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-emerald-400">Required Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="13"
                        max="100"
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Weight (kg)</label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        min="30"
                        max="300"
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Height (cm)</label>
                      <input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        min="100"
                        max="250"
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Activity Level</label>
                      <select
                        name="activityLevel"
                        value={formData.activityLevel}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="">Select Activity Level</option>
                        <option value="sedentary">Sedentary</option>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="active">Active</option>
                        <option value="very_active">Very Active</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Goal</label>
                      <select
                        name="goal"
                        value={formData.goal}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="">Select Goal</option>
                        <option value="lose_weight">Lose Weight</option>
                        <option value="maintain">Maintain Weight</option>
                        <option value="gain_muscle">Gain Muscle</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Optional Fields Section */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-emerald-400">Additional Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300">
                        Dietary Restrictions (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.dietaryRestrictions.join(', ')}
                        onChange={(e) => handleArrayInputChange('dietaryRestrictions', e.target.value)}
                        placeholder="vegetarian, vegan, etc."
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">
                        Allergies (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.allergies.join(', ')}
                        onChange={(e) => handleArrayInputChange('allergies', e.target.value)}
                        placeholder="nuts, dairy, etc."
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">
                        Medical Conditions (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.medicalConditions.join(', ')}
                        onChange={(e) => handleArrayInputChange('medicalConditions', e.target.value)}
                        placeholder="diabetes, hypertension, etc."
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">
                        Preferred Cuisines (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.preferredCuisines.join(', ')}
                        onChange={(e) => handleArrayInputChange('preferredCuisines', e.target.value)}
                        placeholder="Italian, Indian, etc."
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Meals per Day</label>
                      <input
                        type="number"
                        name="mealPreference"
                        value={formData.mealPreference}
                        onChange={handleInputChange}
                        min="3"
                        max="6"
                        required
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Budget</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="">Select Budget</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300">Cooking Time</label>
                      <select
                        name="cookingTime"
                        value={formData.cookingTime}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="">Select Cooking Time</option>
                        <option value="minimal">Minimal</option>
                        <option value="moderate">Moderate</option>
                        <option value="extensive">Extensive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm bg-red-900/20 py-2 px-4 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-400 text-sm bg-emerald-900/20 py-2 px-4 rounded-lg"
                  >
                    {success}
                  </motion.div>
                )}

                {/* Submit Button */}
                <div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    type="submit"
                    disabled={loading}
                    className={`w-full px-4 py-3 rounded-lg text-white font-medium transition-all duration-200
                      ${loading 
                        ? 'bg-slate-700 cursor-not-allowed' 
                        : 'bg-emerald-500 hover:bg-emerald-600'
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Generating Plan...</span>
                      </div>
                    ) : (
                      'Generate Diet Plan'
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 