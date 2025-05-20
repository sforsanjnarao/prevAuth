import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
import {
    KeyIcon, ShieldCheckIcon, UserGroupIcon, ListBulletIcon,
    ShieldExclamationIcon, PlusIcon, BellAlertIcon, ArrowRightIcon
} from '@heroicons/react/24/outline';
import { getVaultStats } from '../api/vaultApi';
import { getAppTrackerStats } from '../api/appTrackerApi';

// Typing animation component
const TypingEffect = ({ text, speed = 150 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text[currentIndex]);
                setCurrentIndex(prev => prev + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, speed]);

    return <span>{displayedText}</span>;
};



function HomePage() {
    const navigate = useNavigate();
    const userName = useSelector((state) => state.auth.user?.name) || 'User';
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [vaultCount, setVaultCount] = useState(null);
    const [trackerStats, setTrackerStats] = useState({ count: null, breachedCount: null });
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    useEffect(() => {
        if (isAuthenticated) {
            const fetchStats = async () => {
                setIsLoadingStats(true);
                try {
                    const [vaultRes, trackerRes] = await Promise.allSettled([
                        getVaultStats(),
                        getAppTrackerStats()
                    ]);

                    if (vaultRes.status === 'fulfilled' && vaultRes.value.success) {
                        setVaultCount(vaultRes.value.count);
                    }

                    if (trackerRes.status === 'fulfilled' && trackerRes.value.success) {
                        setTrackerStats({
                            count: trackerRes.value.count,
                            breachedCount: trackerRes.value.breachedCount
                        });
                    }
                } catch (error) {
                    console.error("Error fetching stats:", error);
                } finally {
                    setIsLoadingStats(false);
                }
            };

            fetchStats();
        }
    }, [isAuthenticated]);

    const hasBreachedApps = trackerStats.breachedCount > 0;

    const handleGetStarted = () => {
        if (isAuthenticated) {
           navigate('/dashboard');
            }
         else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section with Typing Effect */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-6 h-16">
                        <TypingEffect text={`Welcome to SecureSuite${userName ? `, ${userName}` : ''}`} />
                    </h1>
                    <p className="text-xl mb-8">
                        Your all-in-one security solution for password management and breach protection
                    </p>
                    <button
                        onClick={handleGetStarted}
                        className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        {isAuthenticated ? 'View Dashboard' : 'Get Started'}
                        <ArrowRightIcon className="h-5 w-5 inline ml-2" />
                    </button>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose SecureSuite?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                            <div className="bg-blue-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <KeyIcon className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Secure Vault</h3>
                            <p className="text-gray-600">
                                Store and manage all your passwords in one ultra-secure encrypted vault.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                            <div className="bg-purple-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Breach Protection</h3>
                            <p className="text-gray-600">
                                Get instant alerts if your accounts appear in data breaches.
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                            <div className="bg-green-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Developer Tools</h3>
                            <p className="text-gray-600">
                                Generate secure test data and temporary emails for development.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

          

            {/* Call to Action */}
            <div className="bg-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to secure your digital life?</h2>
                    <p className="text-xl mb-8">
                        Join thousands of users who trust SecureSuite with their sensitive data.
                    </p>
                    <Link 
                        to={isAuthenticated ? '/dashboard' : '/register'} 
                        className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg inline-block transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        {isAuthenticated ? 'Go to Dashboard' : 'Sign Up Now'}
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomePage;