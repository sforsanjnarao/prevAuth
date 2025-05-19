import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
    KeyIcon, ShieldCheckIcon, UserGroupIcon, ListBulletIcon,
    ShieldExclamationIcon, PlusIcon, BellAlertIcon,
    ExclamationTriangleIcon, ArrowRightIcon, LockClosedIcon,
    FingerPrintIcon, CodeBracketSquareIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import { getVaultStats } from '../api/vaultApi';
import { getAppTrackerStats } from '../api/appTrackerApi';
import { checkEmailBreachesDirect   } from '../api/BreachApi';

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, isLoading, linkTo, bgColorClass = 'bg-gray-100', textColorClass = 'text-gray-800' }) => (
    <div className={`p-5 rounded-lg shadow border ${isLoading ? 'animate-pulse bg-gray-50' : 'bg-white border-gray-200'} flex flex-col h-full`}>
        <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-md ${bgColorClass}`}>
                <Icon className={`h-5 w-5 ${textColorClass}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="my-4">
            {isLoading ? (
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            ) : (
                <p className="text-3xl font-bold text-gray-900">{value ?? 'N/A'}</p>
            )}
        </div>
        {linkTo && !isLoading && (
            <Link to={linkTo} className="mt-auto inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                View details <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
        )}
    </div>
);

// Alert Card Component
const AlertCard = ({ icon: Icon, title, children, linkTo, bgColorClass = 'bg-red-50', borderColorClass = 'border-red-200', iconColorClass = 'text-red-500' }) => (
    <div className={`p-4 rounded-lg border ${borderColorClass} ${bgColorClass} flex items-start gap-3`}>
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColorClass}`} />
        <div className="flex-1">
            <h4 className="font-semibold text-gray-800">{title}</h4>
            <div className="text-sm text-gray-600 mt-1">
                {children}
            </div>
            {linkTo && (
                <Link to={linkTo} className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2">
                    Take action <ArrowRightIcon className="h-4 w-4 ml-1" />
                </Link>
            )}
        </div>
    </div>
);

function DashboardPage() {
    const { user, isVerified } = useSelector((state) => state.auth);
    const userName = user?.name || 'User';
    const userEmail = user?.email;

    const [stats, setStats] = useState({
        vaultCount: null,
        trackerCount: null,
        breachedCount: null,
        riskSummary: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            try {
                const [vaultRes, trackerRes] = await Promise.all([
                    getVaultStats(),
                    getAppTrackerStats(),
                    
                    

                ]);

                setStats({
                    vaultCount: vaultRes.count,
                    trackerCount: trackerRes.count,
                    breachedCount: trackerRes.breachedCount,
                    riskSummary: trackerRes.riskSummary
                });
            } catch (error) {
                toast.error("Failed to load dashboard data");
                console.error("Dashboard error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleQuickScan = async () => {
        if (!userEmail) {
            toast.error("No email found for scanning");
            return;
        }

        setIsScanning(true);
        try {
            const result = await checkEmailBreachesDirect(userEmail);
            setScanResult({
                breachesFound: result.breachesFound,
                count: result.breaches?.length || 0,
                date: new Date()
            });
            toast[result.breachesFound ? 'warning' : 'success'](
                result.breachesFound 
                    ? `Found ${result.breaches.length} breach(es)` 
                    : "No breaches found"
            );
        } catch (error) {
            toast.error("Scan failed");
            console.error("Scan error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const renderRiskSummary = (summary) => {
        if (!summary) return null;
        const items = [
            { label: 'Critical', count: summary.critical, color: 'bg-red-600' },
            { label: 'High', count: summary.high, color: 'bg-orange-500' },
            { label: 'Medium', count: summary.medium, color: 'bg-yellow-500' },
            { label: 'Low', count: summary.low, color: 'bg-green-500' },
        ];
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {items.filter(i => i.count > 0).map(item => (
                    <span key={item.label} className={`px-2 py-1 rounded-full text-xs font-medium text-white ${item.color}`}>
                        {item.count} {item.label}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome back, {userName}!</h1>
                <p className="text-gray-600">Your security dashboard overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    icon={LockClosedIcon}
                    title="Vault Items"
                    value={stats.vaultCount}
                    isLoading={isLoading}
                    linkTo="/vault"
                    bgColorClass="bg-blue-50"
                    textColorClass="text-blue-600"
                />
                <StatCard 
                    icon={FingerPrintIcon}
                    title="Tracked Apps"
                    value={stats.trackerCount}
                    isLoading={isLoading}
                    linkTo="/app-tracker"
                    bgColorClass="bg-purple-50"
                    textColorClass="text-purple-600"
                />
                <StatCard 
                    icon={ShieldExclamationIcon}
                    title="Breached Apps"
                    value={stats.breachedCount}
                    isLoading={isLoading}
                    linkTo="/breach-check"
                    bgColorClass={stats.breachedCount > 0 ? 'bg-red-50' : 'bg-green-50'}
                    textColorClass={stats.breachedCount > 0 ? 'text-red-600' : 'text-green-600'}
                />
                <StatCard 
                    icon={CodeBracketSquareIcon}
                    title="Developer Tools"
                    value="Access"
                    isLoading={isLoading}
                    linkTo="/fakedata"
                    bgColorClass="bg-indigo-50"
                    textColorClass="text-indigo-600"
                />
            </div>

            {/* Alerts Section */}
            <div className="space-y-4 mb-8">
                {(stats.breachedCount > 0 || !isVerified) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-yellow-800 mb-3">
                            <BellAlertIcon className="h-5 w-5" />
                            Action Recommended
                        </h2>
                        <div className="space-y-3">
                            {stats.breachedCount > 0 && (
                                <AlertCard
                                    icon={ShieldExclamationIcon}
                                    title="Breached Apps Detected"
                                    linkTo="/app-tracker"
                                >
                                    You have {stats.breachedCount} app(s) that appeared in data breaches. 
                                    Consider changing passwords for these services.
                                </AlertCard>
                            )}
                            {!isVerified && (
                                <AlertCard
                                    icon={ExclamationTriangleIcon}
                                    title="Email Not Verified"
                                    linkTo="/verify-email"
                                    bgColorClass="bg-blue-50"
                                    borderColorClass="border-blue-200"
                                    iconColorClass="text-blue-500"
                                >
                                    Verify your email to ensure account security and full feature access.
                                </AlertCard>
                            )}
                        </div>
                    </div>
                )}

                {/* Security Status Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Security Status</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isVerified ? (
                                    <ShieldCheckIcon className="h-6 w-6 text-green-500" />
                                ) : (
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                                )}
                                <span className={isVerified ? "text-green-600" : "text-yellow-600"}>
                                    {isVerified ? "Email Verified" : "Email Not Verified"}
                                </span>
                            </div>
                            {!isVerified && (
                                <Button variant={"link"}>
                                    <Link 
                                        to="/verify-email" 
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        Verify Now
                                    </Link>
                                </Button>
                            )}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-500">Breach Scan</h3>
                                {scanResult?.date && (
                                    <span className="text-xs text-gray-400">
                                        Last scan: {scanResult.date.toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    {!scanResult ? (
                                        <p className="text-gray-500">No scan results available</p>
                                    ) : scanResult.breachesFound ? (
                                        <div className="flex items-center gap-2">
                                            <ShieldExclamationIcon className="h-5 w-5 text-red-500" />
                                            <span className="text-red-600">
                                                {scanResult.count} breach(es) found
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <ShieldCheckIcon className="h-5 w-5 text-green-500" />
                                            <span className="text-green-600">No breaches found</span>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleQuickScan}
                                    disabled={isScanning}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md disabled:opacity-50"
                                >
                                    {isScanning ? 'Scanning...' : 'Run Scan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link
                        to="/vault"
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <KeyIcon className="h-5 w-5 text-blue-500" />
                        <span>Add Vault Item</span>
                    </Link>
                    <Link
                        to="/app-tracker"
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <ListBulletIcon className="h-5 w-5 text-purple-500" />
                        <span>Log App Data</span>
                    </Link>
                    <Link
                        to="/breach-check"
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <ShieldCheckIcon className="h-5 w-5 text-red-500" />
                        <span>Check Breaches</span>
                    </Link>
                    <Link
                        to="/fake-data"
                        className="flex items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
                    >
                        <UserGroupIcon className="h-5 w-5 text-green-500" />
                        <span>Generate Data</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;