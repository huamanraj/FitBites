import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { OptimizedImage } from '../components/Image';
import Spinner from '../components/Spinner';

const logo = new URL('../assets/logo.png', import.meta.url).href;

export default function Auth({ isLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (!isLogin) {
      setPasswordError(validatePassword(newPassword));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin) {
      const passwordValidationError = validatePassword(password);
      if (passwordValidationError) {
        setPasswordError(passwordValidationError);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sm:mx-auto sm:w-full sm:max-w-md w-full px-4 sm:px-0"
      >
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20 relative">
          <Link
            to="/"
            className="absolute top-4 left-4 text-slate-300 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-2"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            <span>Back</span>
          </Link>

          <div className="text-center">
            <OptimizedImage
              src={logo} 
              alt="FitBites Logo" 
              className="w-40 mx-auto"
            />
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-slate-300 text-sm">
              {isLogin 
                ? 'Enter your credentials to access your account' 
                : 'Sign up to start tracking your nutrition'
              }
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required={!isLogin}
                    className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className={`mt-1 block w-full px-4 py-3 bg-slate-800/50 border ${
                    passwordError ? 'border-red-500' : 'border-slate-700'
                  } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all`}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                />
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: password ? 'auto' : 0, opacity: password ? 1 : 0 }}
                    className="mt-2 text-xs space-y-1 overflow-hidden"
                  >
                    <div className={`flex items-center ${password.length >= 8 ? 'text-green-400' : 'text-slate-400'}`}>
                      <span>✓ At least 8 characters</span>
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                      <span>✓ One uppercase letter</span>
                    </div>
                    <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                      <span>✓ One lowercase letter</span>
                    </div>
                    <div className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-400' : 'text-slate-400'}`}>
                      <span>✓ One special character</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm text-center bg-red-900/20 py-2 px-4 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div>
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-5 h-5" />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <span>{isLogin ? 'Sign in' : 'Create account'}</span>
                )}
              </motion.button>
            </div>

            <div className="text-center">
              {isLogin ? (
                <Link
                  to="/signup"
                  className="text-slate-300 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  Don't have an account? Sign up
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-emerald-400 text-sm font-medium transition-colors"
                >
                  Already have an account? Sign in
                </Link>
              )}
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}