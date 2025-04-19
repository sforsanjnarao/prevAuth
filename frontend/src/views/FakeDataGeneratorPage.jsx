// src/pages/FakeDataGeneratorPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; 
import { generateFakeData, getFakeDataHistory } from '../api/fakeDataApi'; // Import API functions
import { UserPlusIcon, ClockIcon, EnvelopeIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

// Simple component to display one item in the history list
const HistoryItem = ({ item }) => {
    // Format date for display
    const formattedDate = new Date(item.createdAt).toLocaleString();

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text)
            .then(() => toast.info(`${type} copied!`, { autoClose: 1500 }))
            .catch(() => toast.error(`Failed to copy ${type}.`));
    };

    // Assuming 'item' structure matches the modified getHistory response
    const fullName = item.fullName || `${item.fakeFirstName} ${item.fakeLastName}`; // Handle both possibilities

    return (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:shadow-md transition-shadow duration-200">
            <div className='flex-grow'>
                <div className='flex items-center mb-1'>
                     {item.fakeAvatarUrl && <img src={item.fakeAvatarUrl} alt="Avatar" className='h-6 w-6 rounded-full mr-2'/>}
                    <span className="font-semibold text-gray-800">{fullName}</span>
                </div>
                 <div className='flex items-center text-sm text-gray-600 group'>
                     <EnvelopeIcon className='h-4 w-4 mr-1 text-gray-400'/>
                     <span className='mr-1'>{item.generatedEmail}</span>
                     <button
                         onClick={() => copyToClipboard(item.generatedEmail, 'Email')}
                         title="Copy Email"
                         className="p-0.5 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 text-gray-500 hover:text-gray-700"
                     >
                          <ClipboardDocumentIcon className="h-4 w-4"/>
                     </button>
                 </div>
                <p className="text-xs text-gray-400 mt-1">Generated: {formattedDate}</p>
                {/* Add other history details if needed, e.g., item.fakeUsername */}
            </div>
            <div className='flex-shrink-0'>
                <Link
                    to={`/fake-data/inbox/${item._id}`} // Link to the inbox view
                    className="inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-1 px-3 rounded transition duration-150 ease-in-out"
                >
                    <EnvelopeIcon className="h-4 w-4 mr-1" />
                    View Inbox
                </Link>
            </div>
        </div>
    );
};


// Main Page Component
function FakeDataGeneratorPage() {
    const [count, setCount] = useState(1); // Number of profiles to generate
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null); // For history fetch errors
    // Store recently generated profiles for immediate display
    const [recentlyGenerated, setRecentlyGenerated] = useState([]);

    // Fetch history on mount
    const loadHistory = useCallback(async () => {
        setIsLoadingHistory(true);
        setError(null);
        try {
            const response = await getFakeDataHistory();
            if (response.success) {
                setHistory(response.data || []);
            } else {
                throw new Error(response.msg || 'Failed to load history');
            }
        } catch (err) {
            setError(err.message);
            toast.error(`Error loading history: ${err.message}`);
            setHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    // Handle generation request
    const handleGenerateClick = async () => {
        if (count <= 0 || count > 5) { // Match backend limit
            toast.warn("Please enter a number between 1 and 5.");
            return;
        }
        setIsGenerating(true);
        setRecentlyGenerated([]); // Clear previous recent results
        setError(null); // Clear previous errors
        try {
            const response = await generateFakeData(count);
            if (response.success) {
                toast.success(response.msg || `Generated ${response.generated?.length || 0} entries.`);
                setRecentlyGenerated(response.generated || []); // Show newly generated
                loadHistory(); // Refresh the full history list
            } else {
                 throw new Error(response.msg || 'Generation failed');
            }
             if (response.warnings && response.warnings.length > 0) {
                 toast.warn(`Generation completed with warnings: ${response.warnings.join(', ')}`);
             }
        } catch (err) {
             setError(err.message);
             toast.error(`Generation failed: ${err.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCountChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            setCount(value);
        } else if (e.target.value === '') {
             setCount(''); // Allow empty input temporarily
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Fake Data Generator</h1>

            {/* Generation Section */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
                <h2 className="text-xl font-semibold mb-3 text-gray-700">Generate New Data</h2>
                <div className='flex flex-col sm:flex-row items-end gap-3'>
                     <div className='flex-grow'>
                        <label htmlFor="generation-count" className="block text-sm font-medium text-gray-700 mb-1">Number of Profiles (1-5)</label>
                        <input
                            type="number"
                            id="generation-count"
                            min="1"
                            max="5" // Match backend limit
                            value={count}
                            onChange={handleCountChange}
                            disabled={isGenerating}
                            className="block w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:opacity-50"
                        />
                     </div>
                     <button
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !count || count <=0 || count > 5}
                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Generating...
                            </>
                        ) : (
                            <>
                                <UserPlusIcon className="h-5 w-5 mr-2 -ml-1"/>
                                Generate Data
                            </>
                        )}
                    </button>
                </div>
                 <p className="text-xs text-gray-500 mt-4">
                    This will create fake user profile(s) and generate a functional temporary email address for each using the <a href="https://mail.tm/" target="_blank" rel="noopener noreferrer" className='text-blue-600 hover:underline'>Mail.tm</a> service.
                </p>
            </div>

            {/* Display Recently Generated (Optional) */}
            {recentlyGenerated.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">Recently Generated</h2>
                    <div className='space-y-3'>
                        {recentlyGenerated.map(item => (
                             // You might want a slightly different display here,
                             // showing more immediate detail than the history item
                             <div key={item._id || item.email} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                 <p><strong>Name:</strong> {item.name}</p>
                                 <p><strong>Email:</strong> {item.email}</p>
                                 <p><strong>Fake Password:</strong> {item.password}</p>
                                 <p><strong>DOB:</strong> {item.dob}</p>
                                 <p><strong>Age:</strong> {item.age}</p>
                                 <p><strong>Address:</strong> {item.address}</p>
                                 <Link
                                    to={`/fake-data/inbox/${item._id}`}
                                    className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                                >
                                    View Inbox
                                </Link>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History Section */}
            <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center">
                    <ClockIcon className='h-5 w-5 mr-2 text-gray-500'/>
                    Generation History
                </h2>
                {isLoadingHistory && <p className='text-gray-500'>Loading history...</p>}
                {!isLoadingHistory && error && <p className='text-red-600'>Error loading history: {error}</p>}
                {!isLoadingHistory && !error && history.length === 0 && (
                    <p className='text-gray-500 bg-gray-50 p-4 rounded-md'>You haven't generated any fake data yet.</p>
                )}
                {!isLoadingHistory && !error && history.length > 0 && (
                     <div className="space-y-3">
                         {history.map(item => (
                            <HistoryItem key={item._id} item={item} />
                         ))}
                     </div>
                )}
            </div>

        </div>
    );
}

export default FakeDataGeneratorPage;