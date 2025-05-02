// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // To get user info and verification status
import { Link } from 'react-router-dom'; // For navigation buttons
import { toast } from 'react-toastify';

// Import API functions as needed (examples below)
import { getVaultItemCount } from '../api/vaultApi'; // Need to create this endpoint/logic
import { getAppTrackerSummary } from '../api/appTrackerApi'; // Need to create this endpoint/logic
import { checkMyEmailBreachesDirect } from '../api/BreachApi'; // If doing quick scan here

// Import Icons
import {
    ShieldCheckIcon,
    ShieldExclamationIcon,
    ExclamationTriangleIcon,
    LockClosedIcon,
    FingerPrintIcon, // Or Squares2X2Icon
    CodeBracketSquareIcon,
    PlusIcon,
    ArrowRightIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';


// Placeholder for data fetching - replace with actual API calls
const fetchDashboardData = async () => {
    // In a real app, this would make multiple API calls concurrently
    // or call a dedicated dashboard summary endpoint
    // For now, return mock data
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
        vaultItemCount: 15, // Example
        appTrackerCount: 8,  // Example
        appTrackerRiskSummary: { critical: 1, high: 2, medium: 3, low: 2 }, // Example
        lastBreachScan: null, // Example: { date: new Date(), breachesFound: true } or null
    };
};

function DashboardPage() {
    // --- Get User Info from Redux ---
    // Adjust selectors based on your authSlice structure
    const userName = useSelector((state) => state.auth.user?.name || 'User'); // Assuming name is stored
    const userEmail = useSelector((state) => state.auth.user?.email);
    const isVerified = useSelector((state) => state.auth.isVerified);
    const userId = useSelector((state) => state.auth.userId); // Needed if making user-specific API calls

    // --- State for Dashboard Data ---
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- State for Quick Breach Scan ---
    const [isScanningBreach, setIsScanningBreach] = useState(false);
    const [quickScanResult, setQuickScanResult] = useState(null); // Store result of quick scan

    // --- Fetch dashboard summary data ---
    useEffect(() => {
        const loadData = async () => {
            if (!userId) return; // Don't fetch if user ID isn't available yet

            setIsLoading(true);
            setError(null);
            try {
                // Replace with actual API call(s)
                const data = await fetchDashboardData();
                setDashboardData(data);
                // Set initial quickScanResult based on fetched last scan data if available
                if (data.lastBreachScan) {
                     setQuickScanResult({
                         breachesFound: data.lastBreachScan.breachesFound,
                         scanDate: data.lastBreachScan.date
                     });
                }

            } catch (err) {
                console.error("Dashboard fetch error:", err);
                setError("Could not load dashboard summary.");
                toast.error("Could not load dashboard summary.");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [userId]); // Re-fetch if user changes


    // --- Handler for Quick Breach Scan ---
    const handleQuickBreachScan = async () => {
        if (!userEmail) {
             toast.error("Cannot perform scan: User email not found.");
             return;
        }
        setIsScanningBreach(true);
        setQuickScanResult(null); // Clear previous result
        try {
            // Use the direct API call function for the quick scan
            const response = await checkMyEmailBreachesDirect(userEmail);
            setQuickScanResult({
                breachesFound: response.breachesFound,
                count: response.breaches?.length || 0,
                scanDate: new Date() // Use current time for this scan
            });
             if (!response.breachesFound) {
                toast.success("Quick Scan: No breaches found!");
             } else {
                toast.warn(`Quick Scan: ${response.breaches.length} breach(es) found! View details for more info.`);
             }
             // TODO: Optionally, update the lastBreachScan date in the backend?
             // This might require another API call. For now, just shows frontend result.

        } catch (err) {
             toast.error(`Breach scan failed: ${err.message}`);
        } finally {
            setIsScanningBreach(false);
        }
    };

    // --- Render Helper for Risk Summary ---
     const renderRiskSummary = (summary) => {
        if (!summary) return null;
        const items = [
            { label: 'Critical', count: summary.critical, color: 'bg-red-600' },
            { label: 'High', count: summary.high, color: 'bg-orange-500' },
            { label: 'Medium', count: summary.medium, color: 'bg-yellow-500' },
            { label: 'Low', count: summary.low, color: 'bg-green-500' },
        ];
        return (
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {items.filter(item => item.count > 0).map(item => (
                    <span key={item.label} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.color} text-white`}>
                        {item.count} {item.label}
                    </span>
                ))}
            </div>
        );
    };


    // --- Main Render ---
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            {/* Welcome Header */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {userName}!</h1>
            <p className="text-gray-600 mb-8">Here's your security snapshot and quick access.</p>

             {/* Verification Notice (If needed - Could be integrated into Security Card) */}
             {/* <VerifyNotice /> */}

            {/* Grid for Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Security Status Card */}
                <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                    <div>
                         <h2 className="text-lg font-semibold text-gray-700 mb-3">Security Status</h2>

                         {/* Email Verification */}
                         <div className='flex items-center mb-4'>
                             {isVerified ? (
                                 <>
                                     <ShieldCheckIcon className='h-6 w-6 text-green-500 mr-2 flex-shrink-0'/>
                                     <span className='text-sm text-green-700 font-medium'>Email Verified</span>
                                 </>
                             ) : (
                                 <>
                                      <ExclamationTriangleIcon className='h-6 w-6 text-yellow-500 mr-2 flex-shrink-0'/>
                                      <div className='flex-grow'>
                                        <span className='text-sm text-yellow-700 font-medium'>Email Not Verified</span>
                                        <Link to="/verify-email" className="block text-xs text-indigo-600 hover:underline">Verify Now</Link>
                                      </div>
                                 </>
                             )}
                         </div>

                         {/* Data Breach Status */}
                         <div className='border-t pt-3'>
                            <p className='text-xs font-medium text-gray-500 mb-2'>Data Breach Scan (Email)</p>
                             <div className='flex items-center mb-2'>
                                 {!quickScanResult && !isScanningBreach && (
                                     <>
                                         <QuestionMarkCircleIcon className='h-6 w-6 text-gray-400 mr-2 flex-shrink-0'/>
                                         <span className='text-sm text-gray-600'>Scan hasn't been run recently.</span>
                                     </>
                                 )}
                                  {quickScanResult && !quickScanResult.breachesFound && (
                                     <>
                                         <ShieldCheckIcon className='h-6 w-6 text-green-500 mr-2 flex-shrink-0'/>
                                         <span className='text-sm text-green-700 font-medium'>No breaches found in last scan.</span>
                                     </>
                                 )}
                                  {quickScanResult && quickScanResult.breachesFound && (
                                     <>
                                          <ShieldExclamationIcon className='h-6 w-6 text-red-500 mr-2 flex-shrink-0'/>
                                          <span className='text-sm text-red-700 font-medium'>{quickScanResult.count} Breach(es) Found!</span>
                                     </>
                                 )}
                             </div>
                            {quickScanResult?.scanDate && <p className='text-xs text-gray-400 mb-3'>Last scan: {quickScanResult.scanDate.toLocaleString()}</p>}

                            <div className='flex gap-2 flex-wrap'>
                                <button
                                    onClick={handleQuickBreachScan}
                                    disabled={isScanningBreach || !userEmail}
                                    className='inline-flex items-center text-sm bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-3 rounded shadow-sm disabled:opacity-50'
                                >
                                     {isScanningBreach ? 'Scanning...' : 'Run Quick Scan'}
                                </button>
                                <Link
                                    to="/breach-check"
                                    className='inline-flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-1.5 px-3 rounded border border-gray-300'
                                >
                                    View Full Report <ArrowRightIcon className='h-3 w-3 ml-1'/>
                                </Link>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Vault Summary Card */}
                <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                    <div>
                         <div className='flex items-center gap-3 mb-2'>
                            <LockClosedIcon className='h-8 w-8 text-indigo-600 opacity-75'/>
                             <h2 className="text-lg font-semibold text-gray-700">Password Vault</h2>
                         </div>
                         <div className='text-center my-4'>
                            <span className='text-4xl font-bold text-indigo-700'>{dashboardData?.vaultItemCount ?? '--'}</span>
                            <p className='text-sm text-gray-500 mt-1'>Items Secured</p>
                         </div>
                    </div>
                     <div className='flex gap-3 border-t pt-3 mt-auto'>
                        <Link to="/vault" className='flex-1 text-center text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-3 rounded'>View Vault</Link>
                        {/* Consider linking directly to open the add modal if possible */}
                        <Link to="/vault" state={{ openAddModal: true }} className='flex-1 text-center text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded'>+ Add Item</Link>
                    </div>
                </div>

                {/* App Tracker Summary Card */}
                 <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                     <div>
                         <div className='flex items-center gap-3 mb-2'>
                             <FingerPrintIcon className='h-8 w-8 text-teal-600 opacity-75'/>
                             <h2 className="text-lg font-semibold text-gray-700">App Tracker</h2>
                         </div>
                          <div className='text-center my-4'>
                            <span className='text-4xl font-bold text-teal-700'>{dashboardData?.appTrackerCount ?? '--'}</span>
                            <p className='text-sm text-gray-500 mt-1'>Apps Tracked</p>
                         </div>
                         {/* Risk Summary Visual */}
                         {dashboardData?.appTrackerRiskSummary && (
                            <div className='mb-3'>
                                 <p className='text-xs font-medium text-gray-500 mb-1'>Risk Overview:</p>
                                 {renderRiskSummary(dashboardData.appTrackerRiskSummary)}
                            </div>
                          )}

                     </div>
                      <div className='flex gap-3 border-t pt-3 mt-auto'>
                         <Link to="/app-tracker" className='flex-1 text-center text-sm bg-teal-100 hover:bg-teal-200 text-teal-700 font-medium py-2 px-3 rounded'>View Tracker</Link>
                         <Link to="/app-tracker" state={{ openAddModal: true }} className='flex-1 text-center text-sm bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-3 rounded'>+ Log App</Link>
                     </div>
                 </div>

                 {/* Fake Data Generator Card (If Feature Enabled) */}
                 <div className="bg-white p-5 rounded-lg shadow border border-gray-200 flex flex-col justify-between">
                     <div>
                         <div className='flex items-center gap-3 mb-2'>
                            <CodeBracketSquareIcon className='h-8 w-8 text-purple-600 opacity-75'/>
                             <h2 className="text-lg font-semibold text-gray-700">Developer Tools</h2>
                         </div>
                         <p className='text-sm text-gray-600 my-4'>
                             Generate realistic fake user profiles and functional temporary email addresses for testing purposes.
                         </p>
                     </div>
                     <div className='border-t pt-3 mt-auto'>
                         <Link to="/fake-data" className='block w-full text-center text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium py-2 px-3 rounded'>
                             Go to Generator <ArrowRightIcon className='h-3 w-3 inline ml-1'/>
                         </Link>
                     </div>
                 </div>

            </div> {/* End Grid */}
        </div>
    );
}

export default DashboardPage;