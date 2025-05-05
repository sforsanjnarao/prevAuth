// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    KeyIcon, ShieldCheckIcon, UserGroupIcon, ListBulletIcon, ArrowRightIcon,
    ShieldExclamationIcon, PlusIcon, BellAlertIcon
} from '@heroicons/react/24/outline';

// Import API functions for stats (assuming they exist now)
import { getVaultStats } from '../api/vaultApi'; // Adjust path
import { getAppTrackerStats } from '../api/appTrackerApi'; // Adjust path
// import { checkMyEmailBreaches } from '../services/securityApi'; // Maybe run a quick check on load?

// Example Stat Card Component
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
             <Link to={linkTo} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 inline-block">View Details →</Link>
        )}
    </div>
);

// Example Alert Card Component
const AlertCard = ({ icon: Icon, title, children, linkTo, bgColorClass = 'bg-red-50', borderColorClass = 'border-red-200', iconColorClass = 'text-red-500' }) => (
    <div className={`p-4 rounded-lg shadow-sm border ${bgColorClass} ${borderColorClass} flex items-start gap-3`}>
         <div className="flex-shrink-0 pt-0.5">
             <Icon className={`h-6 w-6 ${iconColorClass}`} aria-hidden="true" />
         </div>
        <div>
             <h4 className="font-semibold text-sm text-gray-800">{title}</h4>
            <div className="text-xs text-gray-600 mt-1">
                {children}
            </div>
             {linkTo && <Link to={linkTo} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 mt-2 inline-block">Take Action →</Link>}
        </div>
    </div>
);


function DashboardPage() {
    const userName = useSelector((state) => state.auth.user?.name) || 'User';

    const [vaultCount, setVaultCount] = useState(null);
    const [trackerStats, setTrackerStats] = useState({ count: null, breachedCount: null });
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    // const [recentActivity, setRecentActivity] = useState([]); // For later

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoadingStats(true);
            try {
                // Fetch stats in parallel
                const [vaultRes, trackerRes] = await Promise.allSettled([
                    getVaultStats(),
                    getAppTrackerStats()
                    // Add more promises here for other stats if needed
                ]);

                if (vaultRes.status === 'fulfilled' && vaultRes.value.success) {
                    setVaultCount(vaultRes.value.count);
                } else {
                     console.error("Failed to fetch vault stats:", vaultRes.reason);
                     // Optionally show subtle error for stats failure
                }

                if (trackerRes.status === 'fulfilled' && trackerRes.value.success) {
                    setTrackerStats({
                        count: trackerRes.value.count,
                        breachedCount: trackerRes.value.breachedCount
                    });
                } else {
                     console.error("Failed to fetch tracker stats:", trackerRes.reason);
                }

            } catch (error) {
                 // This catch block might not be reached if Promise.allSettled is used
                 console.error("Error fetching dashboard stats:", error);
                 toast.error("Could not load dashboard statistics.");
            } finally {
                setIsLoadingStats(false);
            }
        };

        fetchStats();
    }, []); // Fetch stats on mount

    // Determine overall alert status (example logic)
    const hasBreachedApps = trackerStats.breachedCount > 0;
    // Add more checks here (e.g., weak passwords found - future)

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                    Welcome, {userName}!
                </h1>
                <p className="text-lg text-gray-600">
                    Here's your security and utilities dashboard overview.
                </p>
            </div>

             {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                 <StatCard title="Vault Items" value={vaultCount} isLoading={isLoadingStats} linkTo="/vault" icon={KeyIcon} bgColorClass='bg-blue-50' textColorClass='text-blue-600'/>
                 <StatCard title="Tracked Apps" value={trackerStats.count} isLoading={isLoadingStats} linkTo="/app-tracker" icon={ListBulletIcon} bgColorClass='bg-purple-50' textColorClass='text-purple-600'/>
                 <StatCard title="Apps in Breaches" value={trackerStats.breachedCount} isLoading={isLoadingStats} linkTo="/app-tracker" icon={ShieldExclamationIcon} bgColorClass={hasBreachedApps ? 'bg-red-50' : 'bg-green-50'} textColorClass={hasBreachedApps ? 'text-red-600' : 'text-green-600'}/>
                 {/* Add more stat cards */}
            </div>

            {/* Alerts / Actionable Items Section */}
             {(hasBreachedApps /* || other conditions */) && (
                 <div className="mb-8 p-4 border border-yellow-300 bg-yellow-50 rounded-lg shadow-sm">
                     <h2 className="text-xl font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                        <BellAlertIcon className='h-6 w-6'/> Action Recommended
                     </h2>
                     <div className='space-y-3'>
                        {hasBreachedApps && (
                            <AlertCard title="Breached Apps Detected" linkTo="/app-tracker" icon={ShieldExclamationIcon}>
                                 You have logged <span className='font-bold'>{trackerStats.breachedCount}</span> app(s) that have appeared in known data breaches. Review these apps in the App Tracker and consider changing passwords or taking other security measures.
                            </AlertCard>
                        )}
                        {/* Add more alerts here (e.g., weak passwords, unverified email) */}
                         {!useSelector(state => state.auth.isVerified) && (
                            <AlertCard title="Verify Your Email" linkTo="/verify-email" icon={ShieldExclamationIcon} bgColorClass='bg-blue-50' borderColorClass='border-blue-200' iconColorClass='text-blue-500'>
                                Your account email isn't verified. Verify it now to ensure account security and full feature access.
                            </AlertCard>
                        )}
                    </div>
                 </div>
             )}


            {/* Quick Actions Section */}
            <div className="mb-8">
                 <h2 className="text-xl font-semibold text-gray-700 mb-3">Quick Actions</h2>
                 <div className="flex flex-wrap gap-3">
                      <Link to="/vault" className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition">
                        <KeyIcon className='h-5 w-5 mr-2 text-blue-600'/> Add Vault Item
                      </Link>
                      <Link to="/app-tracker" className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition">
                         <ListBulletIcon className='h-5 w-5 mr-2 text-purple-600'/> Log App Data
                      </Link>
                      <Link to="/breach-check" className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition">
                         <ShieldCheckIcon className='h-5 w-5 mr-2 text-red-600'/> Check Email Breach
                      </Link>
                      <Link to="/fake-data" className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md border border-gray-300 shadow-sm transition">
                         <UserGroupIcon className='h-5 w-5 mr-2 text-green-600'/> Generate Fake Data
                      </Link>
                 </div>
            </div>

            {/* Recent Activity (Placeholder for future) */}
            {/* <div className="border-t pt-6">
                 <h2 className="text-xl font-semibold text-gray-700 mb-3">Recent Activity</h2>
                 <div className='text-gray-500 italic'>Activity feed coming soon...</div>
            </div> */}
        </div>
    );
}

export default DashboardPage;