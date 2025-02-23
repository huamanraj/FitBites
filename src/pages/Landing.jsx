import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '../components/Image';
import { Footer } from '../components/Footer';
import { useEffect } from 'react'; // <-- New import
import { BeakerIcon, ClipboardDocumentListIcon, BoltIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const logo = new URL('../assets/logo.png', import.meta.url).href;

export default function Landing() {
  useEffect(() => {
    document.title = "FitBites | Transform Your Health with AI-Powered Nutrition";

    const setOrUpdateMeta = (selector, tagName, attrName, attrValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement(tagName);
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta Tags
    setOrUpdateMeta('meta[name="description"]', 'meta', 'name', 'description', 'Join FitBites, an AI-powered platform that transforms your health with personalized nutrition and diet plans.');
    setOrUpdateMeta('meta[name="keywords"]', 'meta', 'name', 'keywords', 'health, nutrition, AI, diet plans, personalized nutrition, FitBites');
    setOrUpdateMeta('link[rel="canonical"]', 'link', 'rel', 'canonical', 'https://fitbites.vercel.app/');
    
    // Open Graph Tags
    setOrUpdateMeta('meta[property="og:title"]', 'meta', 'property', 'og:title', 'FitBites | Transform Your Health with AI-Powered Nutrition');
    setOrUpdateMeta('meta[property="og:description"]', 'meta', 'property', 'og:description', 'Join FitBites, an AI-powered platform that transforms your health with personalized nutrition and diet plans.');
    setOrUpdateMeta('meta[property="og:image"]', 'meta', 'property', 'og:image', 'https://fitbites.vercel.app/src/assets/logo.png');
    setOrUpdateMeta('meta[property="og:url"]', 'meta', 'property', 'og:url', 'https://fitbites.vercel.app/');
    setOrUpdateMeta('meta[property="og:type"]', 'meta', 'property', 'og:type', 'website');
    
    // Twitter Card Tags
    setOrUpdateMeta('meta[name="twitter:card"]', 'meta', 'name', 'twitter:card', 'summary_large_image');
    setOrUpdateMeta('meta[name="twitter:title"]', 'meta', 'name', 'twitter:title', 'FitBites | Transform Your Health with AI-Powered Nutrition');
    setOrUpdateMeta('meta[name="twitter:description"]', 'meta', 'name', 'twitter:description', 'Join FitBites, an AI-powered platform that transforms your health with personalized nutrition and diet plans.');
    setOrUpdateMeta('meta[name="twitter:image"]', 'meta', 'name', 'twitter:image', 'https://fitbites.vercel.app/src/assets/logo.png');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <OptimizedImage
            src={logo} 
            alt="FitBites Logo" 
            className="w-48 mx-auto mb-8"
          />
          <h1 className="text-5xl font-bold text-white mb-6">
            Transform Your Health with
            <span className="text-emerald-400 block mt-2">AI-Powered Nutrition</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 leading-relaxed">
            Your all-in-one solution for personalized diet planning and daily nutrition tracking
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              to="/signup"
              className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 group text-lg"
            >
              Create Diet Plan Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 border-2 border-emerald-500/20 text-white font-bold rounded-xl hover:bg-emerald-500/10 transition-all duration-200 flex items-center justify-center gap-2 group text-lg"
            >
              Track Daily Your Diet
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <FeatureCard
            icon={<AiIcon />}
            title="AI-Powered Analysis"
            description="Get instant nutritional insights from your meal descriptions using advanced AI technology"
          />
          <FeatureCard
            icon={<PersonalizedIcon />}
            title="Personalized Plans"
            description="Receive custom diet plans based on your goals, preferences, and dietary restrictions"
          />
          <FeatureCard
            icon={<TrackingIcon />}
            title="Progress Tracking"
            description="Monitor your nutrition journey with detailed analytics and visual insights"
          />
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Why Choose FitBites?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <BenefitItem
              icon={<SmartMealIcon />}
              title="Smart Meal Analysis"
              description="Simply describe your meals and let our AI handle the nutritional calculations"
            />
            <BenefitItem
              icon={<CustomDietIcon />}
              title="Custom Diet Plans"
              description="Get personalized meal plans tailored to your specific health goals"
            />
            <BenefitItem
              icon={<ExerciseIcon />}
              title="Exercise Integration"
              description="Comprehensive workout plans that complement your nutrition goals"
            />
            <BenefitItem
              icon={<MonitoringIcon />}
              title="Progress Monitoring"
              description="Track your journey with intuitive charts and detailed insights"
            />
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-24 "
        >
          <h2 className="text-3xl font-bold text-white mb-6">
            Start Your Health Journey Today
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Join thousands of users transforming their health with FitBites
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-all duration-200 text-lg gap-2 group"
          >
            Get Started Free
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

// Component for feature cards
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-500/20 backdrop-blur-sm hover:border-emerald-500/40 transition-all duration-200 text-center">
      <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}

// Updated BenefitItem component with hover micro-interaction:
function BenefitItem({ title, description, icon }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-slate-800/50 rounded-2xl shadow-md hover:shadow-xl transform hover:scale-105 transition duration-200">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </div>
  );
}

// Icons
function AiIcon() {
  return (
    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function PersonalizedIcon() {
  return (
    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TrackingIcon() {
  return (
    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

// New Icon Components using heroicons:
function SmartMealIcon() {
  return <BeakerIcon className="w-10 h-10 text-emerald-400" />;
}

function CustomDietIcon() {
  return <ClipboardDocumentListIcon className="w-10 h-10 text-emerald-400" />;
}

function ExerciseIcon() {
  return <BoltIcon className="w-10 h-10 text-emerald-400" />;
}

function MonitoringIcon() {
  return <ChartBarIcon className="w-10 h-10 text-emerald-400" />;
}