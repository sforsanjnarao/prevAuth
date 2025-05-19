import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../api/authApi';
import { clearAuth } from '../features/authSlice';
import { toast } from 'react-toastify';
import {
    LockClosedIcon, ShieldCheckIcon, ShieldExclamationIcon, 
    UserGroupIcon, UserCircleIcon, Cog6ToothIcon, 
    ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon,
    ExclamationTriangleIcon, Squares2X2Icon, WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, isVerified, user } = useSelector((state) => state.auth);
    const userName = user?.name || 'User';
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(clearAuth());
            toast.success("Logged out successfully.");
            navigate('/login');
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.error("Logout Error:", error);
            dispatch(clearAuth());
            navigate('/login');
        }
    };

    const navLinkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;

    return (
        <nav className="bg-gray-800 fixed w-full z-30 top-0 shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left Side: Brand Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 text-white font-bold text-xl">
                            {/* Replace with logo image in future */}
                            {/* <img src="/logo.png" alt="Logo" className="h-8 w-auto" /> */}
                            SecureSuite
                        </Link>
                    </div>

                    {/* Right Side: Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                {/* Dashboard Link */}
                                <NavLink to="/dashboard" className={navLinkClass}>
                                    <Squares2X2Icon className="h-5 w-5 inline-block mr-1" />
                                    Dashboard
                                </NavLink>
                                
                                {/* Tools Dropdown */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setIsToolsOpen(!isToolsOpen)}
                                        className={`flex items-center ${navLinkClass({ isActive: false })}`}
                                    >
                                        <WrenchScrewdriverIcon className="h-5 w-5 inline-block mr-1" />
                                        Tools
                                    </button>
                                    
                                    {isToolsOpen && (
                                        <div 
                                            className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                                            onMouseLeave={() => setIsToolsOpen(false)}
                                        >
                                            <Link 
                                                to="/vault" 
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                            >
                                                <LockClosedIcon className="h-4 w-4 inline-block mr-2" />
                                                Vault
                                            </Link>
                                            <Link 
                                                to="/apptracker" 
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                            >
                                                <ShieldCheckIcon className="h-4 w-4 inline-block mr-2" />
                                                App Tracker
                                            </Link>
                                            <Link 
                                                to="/breach-check" 
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                            >
                                                <ShieldExclamationIcon className="h-4 w-4 inline-block mr-2" />
                                                Breach Check
                                            </Link>
                                            <Link 
                                                to="/fakedata" 
                                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                                            >
                                                <UserGroupIcon className="h-4 w-4 inline-block mr-2" />
                                                Fake Data
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* User Profile Dropdown */}
                                <div className="relative ml-3">
                                    <button 
                                        type="button" 
                                        className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                        onClick={() => setIsToolsOpen(false)}
                                    >
                                        <span className="sr-only">Open user menu</span>
                                        <UserCircleIcon className="h-8 w-8 text-gray-400 hover:text-white" />
                                        <span className="text-white ml-2 text-sm font-medium mr-1">
                                            {userName}
                                        </span>
                                        {!isVerified && (
                                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                                        )}
                                    </button>
                                    
                                    <div 
                                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-focus-within:block hover:block"
                                    >
                                        <Link 
                                            to="/profile" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Your Profile
                                        </Link>
                                        <Link 
                                            to="/settings" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Settings
                                        </Link>
                                        <button 
                                            onClick={handleLogout} 
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-x-4">
                                <Link 
                                    to="/login" 
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Log in
                                </Link>
                                <Link 
                                    to="/register" 
                                    className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                    {isAuthenticated ? (
                        <>
                            <NavLink 
                                to="/dashboard" 
                                className={navLinkClass}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <Squares2X2Icon className="h-5 w-5 inline-block mr-2" />
                                Dashboard
                            </NavLink>
                            
                            <div className="pl-2">
                                <button 
                                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                    onClick={() => setIsToolsOpen(!isToolsOpen)}
                                >
                                    <WrenchScrewdriverIcon className="h-5 w-5 inline-block mr-2" />
                                    Tools
                                </button>
                                
                                {isToolsOpen && (
                                    <div className="pl-4 space-y-1 mt-1">
                                        <Link 
                                            to="/vault" 
                                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <LockClosedIcon className="h-4 w-4 inline-block mr-2" />
                                            Vault
                                        </Link>
                                        <Link 
                                            to="/app-tracker" 
                                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ShieldCheckIcon className="h-4 w-4 inline-block mr-2" />
                                            App Tracker
                                        </Link>
                                        <Link 
                                            to="/breach-check" 
                                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <ShieldExclamationIcon className="h-4 w-4 inline-block mr-2" />
                                            Breach Check
                                        </Link>
                                        <Link 
                                            to="/fakedata" 
                                            className="block px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <UserGroupIcon className="h-4 w-4 inline-block mr-2" />
                                            Fake Data
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
                
                <div className="border-t border-gray-700 pb-3 pt-4">
                    {isAuthenticated ? (
                        <>
                            <div className="flex items-center px-5">
                                <div className="flex-shrink-0">
                                    <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                </div>
                                <div className="ml-3">
                                    <div className="text-base font-medium leading-none text-white flex items-center">
                                        {userName}
                                        {!isVerified && (
                                            <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 ml-2" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 space-y-1 px-2">
                                <Link 
                                    to="/profile" 
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Your Profile
                                </Link>
                                <Link 
                                    to="/settings" 
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Settings
                                </Link>
                                <button 
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                >
                                    Sign out
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-1 px-2">
                            <Link 
                                to="/login" 
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Log in
                            </Link>
                            <Link 
                                to="/register" 
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;