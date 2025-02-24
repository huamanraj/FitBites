import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MobileMenu() {
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMenuOpen(!isMenuOpen);
        }}
        className="h-10 w-10 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors duration-200"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
      {isMenuOpen && (
        <div
          className="fixed sm:absolute right-4 sm:right-0 mt-2 w-56 rounded-lg bg-slate-800 border border-slate-700 shadow-lg"
          style={{ zIndex: 1000 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1">
            <Link
              to="/history"
              className="flex items-center px-4 py-3 text-base text-white hover:bg-slate-700"
              onClick={(e) => {
                e.preventDefault();
                setTimeout(() => setIsMenuOpen(false), 100);
                navigate('/history');
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Diet History
            </Link>
            <Link
              to="/diet-plan"
              className="flex items-center px-4 py-3 text-base text-white hover:bg-slate-700"
              onClick={(e) => {
                e.preventDefault();
                setTimeout(() => setIsMenuOpen(false), 100);
                navigate('/diet-plan');
              }}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Get Diet Plan
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
                setIsMenuOpen(false);
              }}
              className="flex w-full items-center px-4 py-3 text-base text-white hover:bg-slate-700"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
