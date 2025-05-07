import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../api/authApi'; // Adjust path
import { clearAuth } from '../features/authSlice'; // Adjust path
import { toast } from 'react-toastify';
// Import Icons (example)
import {
    LockClosedIcon, ShieldCheckIcon, ShieldExclamationIcon, UserGroupIcon,
    UserCircleIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon,
    ExclamationTriangleIcon // For unverified badge
} from '@heroicons/react/24/outline';
// Optional: Headless UI for dropdown
// import { Menu, Transition } from '@headlessui/react';
// import { Fragment } from 'react';


function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, userId, isVerified, user } = useSelector((state) => state.auth); // Adjust state path
    const userName = user?.name || 'User'; // Get name if available in user object

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logoutUser(); // Call API
            dispatch(clearAuth()); // Clear Redux state
            toast.success("Logged out successfully.");
            navigate('/login'); // Redirect to login
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.error("Logout Error:", error);
             // Force clear state even if API fails? Maybe.
             dispatch(clearAuth());
             navigate('/login');
        }
    };

    // Helper for NavLink active state styling
    const navLinkClass = ({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`;


    return (
        <nav className="bg-gray-800 fixed w-full z-30 top-0 shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left Side: Brand and Main Links */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 text-white font-bold text-xl mr-4">
                            {/* Replace with your logo/name */}
                             🛡️ SecureSuite
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {isAuthenticated ? (
                                    <>
                                        <NavLink to="/vault" className={navLinkClass}>
                                            <LockClosedIcon className='h-5 w-5 inline-block mr-1 mb-0.5'/>Vault
                                        </NavLink>
                                        <NavLink to="/apptracker" className={navLinkClass}>
                                            <ShieldCheckIcon className='h-5 w-5 inline-block mr-1 mb-0.5'/>App Tracker
                                        </NavLink>
                                        <NavLink to="/breach-check" className={navLinkClass}>
                                            <ShieldExclamationIcon className='h-5 w-5 inline-block mr-1 mb-0.5'/>Breach Check
                                        </NavLink>
                                        <NavLink to="/fakedata" className={navLinkClass}>
                                            <UserGroupIcon className='h-5 w-5 inline-block mr-1 mb-0.5'/>Fake Data
                                        </NavLink>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Auth/User Menu */}
                    <div className="hidden md:block">
                        <div className="ml-4 flex items-center md:ml-6">
                            {isAuthenticated ? (
                                <div className="relative ml-3">
                                    {/* Replace with Headless UI Menu for better accessibility */}
                                    <button type="button" className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                                         <span className="sr-only">Open user menu</span>
                                         {/* Basic User Icon */}
                                        <UserCircleIcon className='h-8 w-8 text-gray-400 hover:text-white'/>
                                        <span className='text-white ml-2 text-sm font-medium mr-1'>{userName}</span>
                                         {!isVerified && (
                                             <span title="Email not verified">
                                                <ExclamationTriangleIcon className='h-4 w-4 text-yellow-400'/>
                                             </span>
                                         )}
                                    </button>
                                     {/* --- Simple Dropdown Placeholder --- */}
                                     {/* Implement actual dropdown logic here */}
                                     <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-focus-within:block hover:block" role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button" tabIndex="-1">
                                         <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex="-1" id="user-menu-item-0">Your Profile</Link>
                                         <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex="-1" id="user-menu-item-1">Settings</Link>
                                         <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem" tabIndex="-1" id="user-menu-item-2">Sign out</button>
                                     </div>
                                     {/* --- End Placeholder --- */}
                                </div>
                            ) : (
                                <div className='space-x-4'>
                                     <Link to="/login" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Log in</Link>
                                     <Link to="/register" className="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-md text-sm font-medium">Sign up</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" aria-controls="mobile-menu" aria-expanded={isMobileMenuOpen}>
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

             {/* Mobile menu, show/hide based on menu state. */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                    {isAuthenticated ? (
                         <>
                            <NavLink to="/vault" className={navLinkClass}>Vault</NavLink>
                            <NavLink to="/app-tracker" className={navLinkClass}>App Tracker</NavLink>
                            <NavLink to="/breach-check" className={navLinkClass}>Breach Check</NavLink>
                            <NavLink to="/fake-data" className={navLinkClass}>Fake Data</NavLink>
                         </>
                    ) : null}
                </div>
                 <div className="border-t border-gray-700 pb-3 pt-4">
                    {isAuthenticated ? (
                      <>
                         <div className="flex items-center px-5">
                             <div className="flex-shrink-0">
                                 <UserCircleIcon className='h-10 w-10 text-gray-400'/>
                             </div>
                             <div className="ml-3">
                                 <div className="text-base font-medium leading-none text-white flex items-center">
                                    {userName}
                                     {!isVerified && <ExclamationTriangleIcon className='h-4 w-4 text-yellow-400 ml-2'/>}
                                 </div>
                                 {/* Can add email here if needed */}
                             </div>
                         </div>
                        <div className="mt-3 space-y-1 px-2">
                             <Link to="/profile" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Your Profile</Link>
                             <Link to="/settings" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Settings</Link>
                             <button onClick={handleLogout} className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Sign out</button>
                        </div>
                        </>
                    ) : (
                        <div className="space-y-1 px-2">
                             <Link to="/login" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Log in</Link>
                             <Link to="/register" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Sign up</Link>
                        </div>
                    )}
                 </div>
            </div>
        </nav>
    );
}

export default Navbar;