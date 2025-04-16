// src/pages/BreachCheckPage.jsx
import React, { useState } from 'react';
import { checkEmailBreachesDirect } from '../api/BreachApi'; // Import the direct API function
import { ShieldExclamationIcon, ShieldCheckIcon,MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icons for visual feedback
import { toast } from 'react-toastify'; // For notifications


function BreachCheckPage() {
    const [emailToCheck, setEmailToCheck] = useState(''); 
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null); // For API call errors
    const [inputError, setInputError] = useState(null); // For input validation errors
    // Store the structured result: { success, email, breachesFound, breaches, analytics }
    const [breachResult, setBreachResult] = useState(null);
    const [lastCheckTime, setLastCheckTime] = useState(null); // Store timestamp of last check

    // Validate email format (basic regex)
    const isValidEmail = (email) => {
        // Simple regex, consider a more robust one if needed
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };


    // Handler for the check button
    // Handler for the check button / form submission
    const handleCheckBreaches = async (e) => {
        e.preventDefault(); // Prevent default form submission if wrapped in a form
        setInputError(null); // Clear previous input errors
        setError(null); // Clear previous API errors
        setBreachResult(null); // Clear previous results

        if (!emailToCheck) {
            setInputError("Please enter an email address to check.");
            return;
        }
        if (!isValidEmail(emailToCheck)) {
             setInputError("Please enter a valid email address format.");
             return;
        }

        setIsLoading(true);
        try {
            // Call the direct API function with the email from the input state
            const response = await checkEmailBreachesDirect(emailToCheck);
            setBreachResult(response);
            setLastCheckTime(new Date());

            if (!response.breachesFound) {
                 toast.success(`Scan complete: No public breaches found for ${response.email}.`);
            } else {
                 toast.warn(`Scan complete: ${response.breaches.length} breach(es) found for ${response.email}.`);
            }
        } catch (err) {
            const errorMsg = err.message || 'An error occurred during the breach check.';
            setError(errorMsg); // Set API error state
            toast.error(errorMsg);
            setBreachResult(null);
            setLastCheckTime(null);
        } finally {
            setIsLoading(false);
        }
    };


    // Helper to render individual breach details
    const renderBreach = (breach, index) => (
        <div key={breach.breach || index} className="border border-red-300 bg-red-50 p-4 rounded-lg mb-3 shadow-sm">
            <h4 className="font-semibold text-red-800">{breach.breach || 'Unknown Breach'}</h4>
            {breach.domain && <p className="text-sm text-gray-600">{breach.domain}</p>}
            <p className="text-sm text-red-700 mt-1">
                Breach Date: {breach.xposed_date ? breach.xposed_date : 'N/A'}
            </p>
            {breach.xposed_data && (
                 <p className="text-sm text-red-700 mt-1">
                    Compromised Data: <span className="font-medium">{breach.xposed_data.replace(/;/g, ', ')}</span>
                 </p>
            )}
            <p className="text-xs text-red-600 mt-2">
                 ({breach.xposed_records ? `${breach.xposed_records.toLocaleString()} accounts affected` : 'Account count unknown'})
            </p>
             {breach.xposed_data?.toLowerCase().includes('passwords') && (
                 <p className="text-sm font-semibold text-red-800 mt-2">
                     ⚠️ Action Recommended: This breach exposed passwords. Change passwords used on <span className='italic'>{breach.domain || 'this service'}</span> and any other site where the password for this email may have been reused.
                 </p>
             )}
             {breach.details && <p className='text-xs text-gray-700 mt-1 italic'>{breach.details}</p>}
        </div>
    );


    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Data Breach Check</h1>

            {/* Information and Trigger Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
            <p className="text-gray-700 mb-4">
                    Enter any email address to check if it has appeared in known public data breaches.
                </p>
                {/* Use a form for better accessibility and handling */}
                <form onSubmit={handleCheckBreaches} className="flex flex-col sm:flex-row sm:items-end gap-3">
                     <div className="flex-grow">
                         <label htmlFor="email-to-check" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                         <div className="relative">
                            <input
                                type="email"
                                id="email-to-check"
                                value={emailToCheck}
                                onChange={(e) => {
                                    setEmailToCheck(e.target.value);
                                    if(inputError) setInputError(null); // Clear error on type
                                }}
                                placeholder="e.g., user@example.com"
                                className={`block w-full px-3 py-2 border ${inputError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                                aria-describedby={inputError ? "email-error" : undefined}
                                disabled={isLoading}
                            />
                         </div>
                         {inputError && <p id="email-error" className="mt-1 text-xs text-red-600">{inputError}</p>}
                     </div>
                     <button
                        type="submit" // Submit the form
                        disabled={isLoading || !emailToCheck}
                        className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed h-[42px] mt-1 sm:mt-0" // Align height roughly with input
                    >
                        {isLoading ? (
                            <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>

                                 Scanning...
                            </>
                        ) : (
                             <>
                                <MagnifyingGlassIcon className="h-5 w-5 mr-2 -ml-1"/>
                                Scan Email
                             </>
                        )}
                    </button>
                </form>
                 {/* <p className="text-xs text-gray-500 mt-4">
                    Powered by the <a href="https://xposedornot.com/" target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline'>XposedOrNot.com</a> public API.
                </p> */}
            </div>

            {/* API Error Display Area */}
             {error && !isLoading && (
                 <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                    <p className="font-bold">Scan Error</p>
                    <p>{error}</p>
                </div>
            )}

            {/* Results Display Section */}
            {breachResult && !isLoading && !error && (
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">Scan Results for <span className='font-medium text-indigo-700'>{breachResult.email}</span></h2>
                    <p className='text-sm text-gray-500 mb-4'>Scan completed on: {lastCheckTime?.toLocaleString() || 'N/A'}</p>

                    {breachResult.breaches && breachResult.breaches.length > 0 ? (
                        // Breaches Found UI (Only shows if breaches array has items)
                        <div>
                            <div className="flex items-start text-red-700 mb-4 p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
                                <ShieldExclamationIcon className="h-8 w-8 mr-3 flex-shrink-0 text-red-500" />
                                <div>
                                    <h3 className='font-semibold text-lg'>Warning: Breaches Found!</h3>
                                    {/* Text accurately reflects the count */}
                                    <p className='text-sm'>This email address was found in <span className='font-bold'>{breachResult.breaches.length}</span> public data breach(es). Review the details below.</p>
                                </div>
                            </div>
                            {/* Map and render the actual breaches */}
                            {breachResult.breaches.map(renderBreach)}
                        </div>
                    ) : (
                        // No Breaches Found UI (Shows if breaches array is empty or null)
                         <div className="flex items-start text-green-700 mb-4 p-4 bg-green-50 rounded-lg border border-green-200 shadow-sm">
                            <ShieldCheckIcon className="h-8 w-8 mr-3 flex-shrink-0 text-green-500" />
                             <div>
                                <h3 className='font-semibold text-lg'>No Breaches Found</h3>
                                {/* Added email here for clarity */}
                                <p className='text-sm'>Good news! This email address (<span className='font-medium'>{breachResult.email}</span>) was not found in the XposedOrNot database of public breaches.</p>
                             </div>
                         </div>
                    )}

                </div>
            )}

        </div>
    );
}

export default BreachCheckPage;