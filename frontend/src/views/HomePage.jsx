import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
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

// Reusable Stat Card Component
const StatCard = ({ icon: Icon, title, value, isLoading, linkTo, bgColorClass = 'bg-gray-100', textColorClass = 'text-gray-800' }) => (
    <div className={`p-4 rounded-lg shadow border ${isLoading ? 'animate-pulse bg-gray-50' : 'bg-white border-gray-200'}`}>
        <div className={`inline-flex p-2 rounded-md ${bgColorClass} mb-3`}>
            <Icon className={`h-5 w-5 ${textColorClass}`} aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        {isLoading ? (
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        ) : (
            <p className="text-2xl font-semibold text-gray-900">{value ?? 'N/A'}</p>
        )}
        {linkTo && !isLoading && (
            <Link to={linkTo} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
                View Details →
            </Link>
        )}
    </div>
);

function HomePage() {
    const navigate = useNavigate();
    const userName = useSelector((state) => state.auth.user?.name) || 'User';
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [vaultCount, setVaultCount] = useState(null);
    const [trackerStats, setTrackerStats] = useState({ count: null, breachedCount: null });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [showDashboard, setShowDashboard] = useState(false);

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
            setShowDashboard(true);
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section with Typing Effect */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 h-16">
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

            {/* Dashboard Preview Section (shown when authenticated) */}
            {isAuthenticated && showDashboard && (
                <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Your Security Dashboard</h2>
                        
                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                            <StatCard 
                                title="Vault Items" 
                                value={vaultCount} 
                                isLoading={isLoadingStats} 
                                linkTo="/vault" 
                                icon={KeyIcon} 
                                bgColorClass='bg-blue-50' 
                                textColorClass='text-blue-600'
                            />
                            <StatCard 
                                title="Tracked Apps" 
                                value={trackerStats.count} 
                                isLoading={isLoadingStats} 
                                linkTo="/app-tracker" 
                                icon={ListBulletIcon} 
                                bgColorClass='bg-purple-50' 
                                textColorClass='text-purple-600'
                            />
                            <StatCard 
                                title="Apps in Breaches" 
                                value={trackerStats.breachedCount} 
                                isLoading={isLoadingStats} 
                                linkTo="/app-tracker" 
                                icon={ShieldExclamationIcon} 
                                bgColorClass={hasBreachedApps ? 'bg-red-50' : 'bg-green-50'} 
                                textColorClass={hasBreachedApps ? 'text-red-600' : 'text-green-600'}
                            />
                        </div>

                        {/* Alerts Section */}
                        {(hasBreachedApps) && (
                            <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 rounded-lg shadow-sm">
                                <h2 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                    <BellAlertIcon className='h-6 w-6'/> Action Recommended
                                </h2>
                                <div className='space-y-3'>
                                    {hasBreachedApps && (
                                        <div className="p-4 rounded-lg shadow-sm border bg-red-50 border-red-200 flex items-start gap-3">
                                            <div className="flex-shrink-0 pt-0.5">
                                                <ShieldExclamationIcon className="h-6 w-6 text-red-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-800">Breached Apps Detected</h4>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    You have logged <span className='font-bold'>{trackerStats.breachedCount}</span> app(s) that have appeared in known data breaches.
                                                </div>
                                                <Link to="/app-tracker" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
                                                    Take Action →
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions Section */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>
                            <div className="flex flex-wrap gap-3">
                                <Link 
                                    to="/vault" 
                                    className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition"
                                >
                                    <KeyIcon className='h-5 w-5 mr-2 text-blue-600'/> Add Vault Item
                                </Link>
                                <Link 
                                    to="/app-tracker" 
                                    className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition"
                                >
                                    <ListBulletIcon className='h-5 w-5 mr-2 text-purple-600'/> Log App Data
                                </Link>
                                <Link 
                                    to="/breach-check" 
                                    className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition"
                                >
                                    <ShieldCheckIcon className='h-5 w-5 mr-2 text-red-600'/> Check Email Breach
                                </Link>
                                <Link 
                                    to="/fake-data" 
                                    className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition"
                                >
                                    <UserGroupIcon className='h-5 w-5 mr-2 text-green-600'/> Generate Fake Data
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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