import { useState, useEffect } from 'react';
import { databases, Query } from '../config/appwrite';
import { DATABASE_ID, COLLECTION_ID } from '../config/appwrite';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function History() {
  const { user } = useAuth();
  const [foodEntries, setFoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 15; // Show more entries per page

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

  const paginatedEntries = foodEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const totalPages = Math.ceil(foodEntries.length / entriesPerPage);

  const renderPaginationButtons = () => {
    const pageWindow = 2; // Number of pages to show on each side of current page
    let buttons = [];

    // Always show first page
    buttons.push(
      <button
        key={1}
        onClick={() => setCurrentPage(1)}
        className={`px-3 py-1 rounded-md text-sm ${
          currentPage === 1
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        1
      </button>
    );

    // Calculate range of pages to show
    let startPage = Math.max(2, currentPage - pageWindow);
    let endPage = Math.min(totalPages - 1, currentPage + pageWindow);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      buttons.push(
        <span key="ellipsis1" className="px-2 text-slate-400">
          ...
        </span>
      );
    }

    // Add pages within the window
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === i
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {i}
        </button>
      );
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      buttons.push(
        <span key="ellipsis2" className="px-2 text-slate-400">
          ...
        </span>
      );
    }

    // Always show last page if there is more than one page
    if (totalPages > 1) {
      buttons.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 rounded-md text-sm ${
            currentPage === totalPages
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Back Button */}
        <div className="flex justify-between items-center bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-4">
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
          <h1 className="text-2xl font-bold text-emerald-400">Historical Entries</h1>
        </div>

        {/* Historical Data */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="inline-block min-w-full align-middle">
                  {foodEntries.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      No entries found. Start your nutrition tracking journey today!
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-slate-700">
                      <thead>
                        <tr className="text-slate-300 text-left text-xs uppercase tracking-wider">
                          <th className="px-4 py-3">Date</th>
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
                        {paginatedEntries.map((entry) => (
                          <tr key={entry.$id} className="text-sm">
                            <td className="px-4 py-3 whitespace-nowrap">
                              {format(new Date(entry.timestamp), 'MMM d, HH:mm')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-xs sm:max-w-sm truncate" title={entry.description}>
                                {entry.description}
                              </div>
                            </td>
                            <td className="px-4 py-3">{entry.calories} kcal</td>
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

              {/* Replace the existing Pagination section with this */}
              {totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {renderPaginationButtons()}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md text-sm bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
