import { useState, useEffect, useRef } from 'react';
import { databases, Query } from '../config/appwrite';
import { DATABASE_ID, COLLECTION_ID } from '../config/appwrite';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FoodInput from '../components/FoodInput';
import { motion } from 'framer-motion';
import { format, startOfToday, subDays, isToday, startOfDay, isSameDay } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const entriesPerPage = 10;

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          COLLECTION_ID,
          [
            Query.equal('userId', user.$id),
            Query.orderDesc('timestamp'),
          ]
        );
        setFoodEntries(response.documents);
      } catch (error) {
        console.error('Error fetching food entries:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.$id) {
      fetchEntries();
    }
  }, [user?.$id]);

  const todayEntries = foodEntries.filter(entry => 
    isToday(new Date(entry.timestamp))
  );

  const getWeeklyData = () => {
    const today = startOfToday();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, i);
      const entries = foodEntries.filter(entry => 
        isSameDay(new Date(entry.timestamp), date)
      );
      
      const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0);
      
      return {
        date: format(date, 'MMM d'),
        calories: totalCalories,
        entries: entries.length,
        details: entries.map(e => ({
          food: e.description,
          calories: e.calories
        }))
      };
    }).reverse();

    return last7Days;
  };

  const paginatedEntries = foodEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.ceil(foodEntries.length / entriesPerPage);

  const handleNewEntry = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('userId', user.$id),
          Query.orderDesc('timestamp'),
        ]
      );
      setFoodEntries(response.documents);
    } catch (error) {
      console.error('Error updating food entries:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Replace the desktop buttons div with this new menu
  const menuButton = (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-800 border border-slate-700 shadow-lg z-50">
          <div className="py-1">
            <Link
              to="/history"
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Diet History
            </Link>
            <Link
              to="/diet-plan"
              className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-700"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Get Diet Plan
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="flex cursor-pointer items-center w-full px-4 py-2 text-sm text-white hover:bg-slate-700"
            >
              <svg className="w-4 h-4  mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between rounded-xl p-6">
          <div className="flex justify-between items-center sm:items-start">
            <div className="flex flex-col ">
              <img 
                src={logo} 
                alt="FitBites Logo" 
                className="w-25 object-contain"
              />
              <div className="hidden sm:block mt-4 text-center">
                <h1 className="text-3xl font-bold">
                  Hello, <span className="text-emerald-400">{user?.name || 'User'}</span>
                </h1>
                <p className="text-slate-400 text-sm">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex sm:hidden">
              {menuButton}
            </div>
          </div>
          
          {/* Mobile greeting - shown below logo */}
          <div className="mt-4 sm:hidden">
            <h1 className="text-2xl font-bold">
              Hello, <span className="text-emerald-400">{user?.name || 'User'}</span>
            </h1>
            <p className="text-slate-400 text-sm">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm:flex items-start gap-4">
            <Link
              to="/diet-plan"
              className="h-8 px-4 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors duration-200 text-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Get Diet Plan
            </Link>
            {menuButton}
          </div>
        </div>

        <FoodInput onNewEntry={handleNewEntry} />

        {/* Today's Summary Grid */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-slate-400">Total Calories</div>
              <div className="text-2xl font-bold text-emerald-400">
                {todayEntries.reduce((sum, entry) => sum + entry.calories, 0)} 
                <span className="text-sm text-slate-400 ml-1">kcal</span>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-slate-400">Total Protein</div>
              <div className="text-2xl font-bold text-emerald-400">
                {todayEntries.reduce((sum, entry) => sum + entry.protein, 0)}
                <span className="text-sm text-slate-400 ml-1">g</span>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-slate-400">Total Carbs</div>
              <div className="text-2xl font-bold text-emerald-400">
                {todayEntries.reduce((sum, entry) => sum + entry.carbs, 0)}
                <span className="text-sm text-slate-400 ml-1">g</span>
              </div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <div className="text-sm text-slate-400">Total Fat</div>
              <div className="text-2xl font-bold text-emerald-400">
                {todayEntries.reduce((sum, entry) => sum + entry.fat, 0)}
                <span className="text-sm text-slate-400 ml-1">g</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Today's Summary */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Today's Entries</h2>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="inline-block min-w-full align-middle">
                  {todayEntries.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      No entries for today. Start tracking your meals!
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead>
                        <tr className="text-slate-300 text-left text-xs uppercase tracking-wider">
                          <th className="px-4 py-3">Time</th>
                          <th className="px-4 py-3">Food</th>
                          <th className="px-4 py-3">Calories</th>
                          <th className="px-4 py-3">
                            <span className="hidden sm:inline">Protein</span>
                            <span className="sm:hidden">P</span>
                          </th>
                          <th className="px-4 py-3">
                            <span className="hidden sm:inline">Carbs</span>
                            <span className="sm:hidden">C</span>
                          </th>
                          <th className="px-4 py-3">
                            <span className="hidden sm:inline">Fat</span>
                            <span className="sm:hidden">F</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {todayEntries.map((entry) => (
                          <tr key={entry.$id} className="text-sm">
                            <td className="px-4 py-3 whitespace-nowrap">
                              {format(new Date(entry.timestamp), 'HH:mm')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-[120px] sm:max-w-sm truncate" title={entry.description}>
                                {entry.description}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{entry.calories} kcal</td>
                            <td className="px-4 py-3 whitespace-nowrap">{entry.protein}g</td>
                            <td className="px-4 py-3 whitespace-nowrap">{entry.carbs}g</td>
                            <td className="px-4 py-3 whitespace-nowrap">{entry.fat}g</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Weekly Calorie Intake</h2>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getWeeklyData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8"
                      tickMargin={10}
                    />
                    <YAxis 
                      stroke="#94a3b8"
                      tickMargin={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700">
                              <p className="text-emerald-400 font-semibold mb-2">{data.date}</p>
                              <p className="text-white font-medium">{data.calories} calories</p>
                              <p className="text-slate-400 text-sm">{data.entries} meals</p>
                              {data.details.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  <p className="text-slate-400 text-xs mb-1">Meals:</p>
                                  {data.details.map((meal, i) => (
                                    <div key={i} className="text-sm">
                                      <span className="text-slate-300">{meal.food}</span>
                                      <span className="text-emerald-400 ml-2">{meal.calories} cal</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      activeDot={{ 
                        r: 6, 
                        fill: '#10b981',
                        stroke: '#fff',
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Add this button before the closing main div */}
            <div className="flex justify-end gap-4">
              <Link
                to="/history"
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Diet History
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}